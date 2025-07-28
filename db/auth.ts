import { defineTable, column } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text({ optional: true }),
    email: column.text({ unique: true }),
    emailVerified: column.boolean({ default: false }),
    image: column.text({ optional: true }),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
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
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
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
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
  },
});

const Verification = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    identifier: column.text(),
    value: column.text(),
    expiresAt: column.text(),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
  },
});

export const Auth = { User, Session, Account, Verification };
