import { openai, isMockAi } from './client.js';

/**
 * Menghasilkan representasi vektor embeddings (1536 dimensi) dari teks input.
 * Mendukung model 'text-embedding-3-small' dari OpenAI.
 * Jika dalam mode mock, mengembalikan vektor acak yang dinormalisasi untuk kompatibilitas pgvector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (isMockAi || !openai) {
    // Mode Mock: Hasilkan vektor 1536 dimensi yang dinormalisasi secara acak
    console.log('[AI-Embedder] Generating mock embedding vector (1536 dimensions)...');
    const mockVector = Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
    
    // Normalisasi vektor agar memiliki panjang unit (L2 norm = 1)
    const magnitude = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0));
    return mockVector.map(val => val / (magnitude || 1));
  }

  try {
    const cleanedText = text.replace(/\n/g, ' ').trim().slice(0, 8000); // Batasi panjang teks agar tidak melebihi batas token
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleanedText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[AI-Embedder] Error generating embedding from OpenAI:', error);
    throw error;
  }
}
