import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@tender-hunter/shared";
import * as schema from "@tender-hunter/shared";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
          user: schema.users,
          session: schema.session,
          account: schema.account,
          verification: schema.verification
        }
    }),
    emailAndPassword: {
        enabled: true
    }
});
