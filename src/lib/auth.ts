import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, Account, Session, User, Verification } from "astro:db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: User,
      session: Session,
      account: Account,
      verification: Verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
});
