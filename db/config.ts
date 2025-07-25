import { defineDb, defineTable, column } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text({ optional: true }),
    email: column.text({ unique: true }),
    emailVerified: column.boolean({ default: false }),
    image: column.text({ optional: true }),
    createdAt: column.text({ default: new Date().toISOString() }),
    updatedAt: column.text({ default: new Date().toISOString() }),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    token: column.text({ unique: true }),
    expiresAt: column.text(),
    ipAddress: column.text({ optional: true }),
    userAgent: column.text({ optional: true }),
    createdAt: column.text({ default: new Date().toISOString() }),
    updatedAt: column.text({ default: new Date().toISOString() }),
  },
});

const Account = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    accountId: column.text(),
    providerId: column.text(),
    accessToken: column.text({ optional: true }),
    refreshToken: column.text({ optional: true }),
    accessTokenExpiresAt: column.text({ optional: true }),
    refreshTokenExpiresAt: column.text({ optional: true }),
    scope: column.text({ optional: true }),
    idToken: column.text({ optional: true }),
    password: column.text({ optional: true }),
    createdAt: column.text({ default: new Date().toISOString() }),
    updatedAt: column.text({ default: new Date().toISOString() }),
  },
});

const Verification = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    identifier: column.text(),
    value: column.text(),
    expiresAt: column.text(),
    createdAt: column.text({ default: new Date().toISOString() }),
    updatedAt: column.text({ default: new Date().toISOString() }),
  },
});

export default defineDb({
  tables: {
    User,
    Session,
    Account,
    Verification,
  },
});
