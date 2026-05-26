import { Hono } from 'hono';
import { db, tenders, organizations, desc, eq, and, sql, or } from '@tender-hunter/shared';
import { generateEmbedding } from '../ai/embedder.js';
import { calculateMatchScore } from '../ai/matcher.js';
import { crawlerEngine } from '../crawler/engine.js';

const tenderRouter = new Hono();

/**
 * GET /api/tenders/search
 * Hybrid search (Keyword FTS + pgvector Semantic Search) with advanced filters and dynamic AI Match Scoring
 */
tenderRouter.get('/search', async (c) => {
  try {
    const query = c.req.query('q');
    const category = c.req.query('category');
    const budgetMin = c.req.query('budgetMin') ? parseInt(c.req.query('budgetMin')!, 10) : undefined;
    const budgetMax = c.req.query('budgetMax') ? parseInt(c.req.query('budgetMax')!, 10) : undefined;
    const province = c.req.query('province');
    const status = c.req.query('status') || 'open';
    const minMatchScore = c.req.query('minMatchScore') ? parseInt(c.req.query('minMatchScore')!, 10) : undefined;
    const orgId = c.req.query('orgId');

    // 1. Dapatkan Profil Organisasi Penyewa untuk perhitungan AI Match Score
    let activeOrg: any = null;
    if (orgId) {
      activeOrg = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
      });
    } else {
      // Fallback: Ambil organisasi pertama di database untuk kemudahan simulasi/testing
      activeOrg = await db.query.organizations.findFirst();
    }

    // 2. Buat filter SQL dinamis menggunakan operator and/or Drizzle
    const whereConditions: any[] = [];
    
    if (status) {
      whereConditions.push(eq(tenders.status, status));
    }
    if (category) {
      whereConditions.push(eq(tenders.category, category));
    }
    if (budgetMin !== undefined) {
      whereConditions.push(sql`${tenders.budget} >= ${budgetMin}`);
    }
    if (budgetMax !== undefined) {
      whereConditions.push(sql`${tenders.budget} <= ${budgetMax}`);
    }
    if (province) {
      whereConditions.push(eq(tenders.province, province));
    }

    let allTenders: any[] = [];

    // 3. Eksekusi Pencarian
    if (query && query.trim() !== '') {
      console.log(`[TenderSearch] Executing hybrid search for: "${query}"`);
      
      try {
        // A. Hasilkan vektor embeddings dari query pencarian
        const queryEmbedding = await generateEmbedding(query);
        
        // B. Eksekusi hybrid search di database
        // pgvector `<=>` mengukur cosine distance. Drizzle sql helper digunakan untuk menyusun query-nya.
        // Kita juga menambahkan pencarian kata kunci teks lengkap (FTS) menggunakan to_tsvector PostgreSQL.
        const vectorDistanceSql = sql`${tenders.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`;
        const ftsMatchSql = sql`to_tsvector('indonesian', coalesce(${tenders.title}, '') || ' ' || coalesce(${tenders.aiSummary}, '') || ' ' || coalesce(${tenders.qualification}, '')) @@ plainto_tsquery('indonesian', ${query})`;

        // Kita gabungkan kondisi pencarian semantik (distance < 0.8 / kecocokan cukup dekat) atau FTS match
        const searchConditions = and(
          ...whereConditions,
          or(
            sql`${vectorDistanceSql} < 0.85`, // Batas ambang kemiripan semantik
            ftsMatchSql
          )
        );

        allTenders = await db.select({
          id: tenders.id,
          sourceId: tenders.sourceId,
          externalId: tenders.externalId,
          url: tenders.url,
          title: tenders.title,
          organizationName: tenders.organizationName,
          budget: tenders.budget,
          budgetCurrency: tenders.budgetCurrency,
          category: tenders.category,
          subcategory: tenders.subcategory,
          procurementType: tenders.procurementType,
          region: tenders.region,
          province: tenders.province,
          city: tenders.city,
          qualification: tenders.qualification,
          eligibility: tenders.eligibility,
          documentRequirements: tenders.documentRequirements,
          timeline: tenders.timeline,
          status: tenders.status,
          aiSummary: tenders.aiSummary,
          aiRiskFlags: tenders.aiRiskFlags,
          aiHiddenRequirements: tenders.aiHiddenRequirements,
          createdAt: tenders.createdAt,
          updatedAt: tenders.updatedAt,
          semanticDistance: vectorDistanceSql,
        })
        .from(tenders)
        .where(searchConditions)
        // Urutkan berdasarkan kemiripan vektor tertinggi (jarak semantik terkecil)
        .orderBy(asc(vectorDistanceSql))
        .limit(40);

      } catch (embedError) {
        console.error('[TenderSearch] Embedding search failed, falling back to full-text keyword search:', embedError);
        
        // Fallback FTS kata kunci jika model embeddings gagal/timeout
        const ftsMatchSql = sql`to_tsvector('indonesian', coalesce(${tenders.title}, '') || ' ' || coalesce(${tenders.aiSummary}, '') || ' ' || coalesce(${tenders.qualification}, '')) @@ plainto_tsquery('indonesian', ${query})`;
        
        allTenders = await db.query.tenders.findMany({
          where: and(...whereConditions, ftsMatchSql),
          orderBy: [desc(tenders.createdAt)],
          limit: 40,
        });
      }
    } else {
      // C. Pencarian Standar tanpa query pencarian (hanya filter dasar)
      console.log('[TenderSearch] Executing standard filter-only search');
      allTenders = await db.query.tenders.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        orderBy: [desc(tenders.createdAt)],
        limit: 40,
      });
    }

    // 4. Hitung AI Match Score dinamis untuk hasil yang dikembalikan
    const resultsWithMatchScores = [];

    for (const tender of allTenders) {
      let matchInfo = {
        matchScore: 0,
        matchJustification: { 
          strengths: [] as string[], 
          gaps: [] as string[], 
          recommendations: [] as string[] 
        }
      };

      if (activeOrg) {
        try {
          matchInfo = await calculateMatchScore(activeOrg, tender);
        } catch (matchErr) {
          console.error(`[TenderSearch] Failed to calculate match score for tender ${tender.id}:`, matchErr);
        }
      }

      // Filter berdasarkan minimum Match Score jika ditentukan oleh user
      if (minMatchScore !== undefined && matchInfo.matchScore < minMatchScore) {
        continue;
      }

      resultsWithMatchScores.push({
        ...tender,
        aiMatch: {
          score: matchInfo.matchScore,
          justification: matchInfo.matchJustification,
        }
      });
    }

    // Urutkan berdasarkan AI Match Score tertinggi jika minMatchScore diset atau secara default untuk visual premium
    resultsWithMatchScores.sort((a, b) => b.aiMatch.score - a.aiMatch.score);

    return c.json({
      count: resultsWithMatchScores.length,
      organization: activeOrg ? { id: activeOrg.id, name: activeOrg.name } : null,
      tenders: resultsWithMatchScores,
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[TenderSearch] Error in search endpoint:', error);
    return c.json({ error: errMsg }, 500);
  }
});

/**
 * GET /api/tenders
 * List tenders with basic pagination
 */
tenderRouter.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const offset = (page - 1) * limit;
  const status = c.req.query('status');

  const allTenders = await db.query.tenders.findMany({
    orderBy: [desc(tenders.createdAt)],
    limit,
    offset,
    where: status ? eq(tenders.status, status) : undefined,
  });

  return c.json({
    data: allTenders,
    pagination: { page, limit, offset },
  });
});

/**
 * GET /api/tenders/:id
 * Get a single tender by ID with its dynamic AI Match Score computed
 */
tenderRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const orgId = c.req.query('orgId');

  const tender = await db.query.tenders.findFirst({
    where: eq(tenders.id, id),
  });

  if (!tender) {
    return c.json({ error: 'Tender not found' }, 404);
  }

  // Cari profil organisasi penyewa
  let activeOrg: any = null;
  if (orgId) {
    activeOrg = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });
  } else {
    activeOrg = await db.query.organizations.findFirst();
  }

  let aiMatch = {
    score: 0,
    justification: { 
      strengths: [] as string[], 
      gaps: [] as string[], 
      recommendations: [] as string[] 
    }
  };

  if (activeOrg) {
    try {
      const matchResult = await calculateMatchScore(activeOrg, tender);
      aiMatch = {
        score: matchResult.matchScore,
        justification: matchResult.matchJustification,
      };
    } catch (err) {
      console.error(`[TenderDetail] Failed to compute match score:`, err);
    }
  }

  return c.json({
    ...tender,
    aiMatch,
  });
});

/**
 * POST /api/tenders/:id/analyze
 * Manually trigger AI Enrichment Analysis for a specific tender on-demand
 */
tenderRouter.post('/:id/analyze', async (c) => {
  const id = c.req.param('id');

  const tender = await db.query.tenders.findFirst({
    where: eq(tenders.id, id),
  });

  if (!tender) {
    return c.json({ error: 'Tender not found' }, 404);
  }

  try {
    console.log(`[TenderAPI] Manually triggering AI enrichment for tender: ${tender.title}`);
    await crawlerEngine.enrichTenderWithAi(tender.id);
    
    // Ambil ulang data ter-update
    const updatedTender = await db.query.tenders.findFirst({
      where: eq(tenders.id, id),
    });

    return c.json({
      message: 'Tender successfully analyzed by AI intelligence.',
      tender: updatedTender,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return c.json({ error: errMsg }, 500);
  }
});

// Penolong pengurutan Drizzle (asc)
function asc(col: any) {
  return sql`${col} ASC`;
}

export default tenderRouter;
