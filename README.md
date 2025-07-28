# Astro DB, Turso & Better Auth

> [!WARNING]  
> This repo and the instructions below are currently in progress.

A simple project created with **Astro**, **Astro DB** and **Better Auth**, connected to a **Turso Database**. Emails powered by **Resend**.

I've kept most auth logic client side after reading this recommendation: https://github.com/better-auth/better-auth/pull/2987/files?short_path=526860b#diff-526860b5c0d9d9e59a79a28fcead2aac495dddaff1d4ce4f2867372c25410653

---

## Getting started

### Prerequisites

- Node.js 18+
- Turso account
- Resend account (for email sending)

### Setup

Follow these steps to set up and run the application locally:

1. **Clone the repository**

```sh
git clone https://github.com/matthewgoodyear/astro-db-better-auth
cd astro-db-better-auth
```

2. **Install dependencies**

```sh
npm install
```

3. **Environment setup**

Copy the `.env.example` file to `.env` and fill in the values.

```sh
cp .env.example .env
```

4. **Start dev server**

```sh
npm run dev
```

---

## Step by step guide

### Project set up

Create Astro project

```sh
npm create astro@latest
```

Add Astro DB

```sh
npx astro add db
```

Install Tailwind & BasecoatUI (optional)

```sh
npx astro add tailwind
npm install basecoat-css
```

### Better Auth set up

Install Better Auth

```sh
npm install better-auth
```

#### Set environment variables

Generate a secret key.

```
BETTER_AUTH_SECRET=your-secret-here
```

#### Create the schema

We then need to create the schema here to match the schema that Better Auth is expecting. You can find the schema here: https://www.better-auth.com/docs/concepts/database

#### Create a Better Auth instance

Create a file named `auth.ts` in the `lib/` folder. This is the bit that tripped me up for a while, but using the Drizzle Adapter and passing our database schema into this seemed to do the trick.

```js
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
  },
});
```

#### Mount the handler

Create an API route here `pages/api/auth/[...all].ts`

```ts
import { auth } from "../../../lib/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};
```

#### Create client instance

Create the auth client in `lib/auth-client.ts`

```ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient();
```

#### Types

Set up type definitions for `user` and `session` objects in the `/src/env.d.ts` file.

```ts
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
  }
}
```

#### Middleware

Create a file here `src/middleware/index.ts` with the following code:

```js
import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;
  context.locals.session = null;
  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  });
  if (isAuthed) {
    context.locals.user = isAuthed.user;
    context.locals.session = isAuthed.session;
  }
  return next();
});
```

#### Deployments

To get preview deployments to work, you need to add the URL to the list of trusted origins in the Better Auth config `lib/auth.ts`. This can be done with environment variables exposed by your platform of choice.

```js
export const auth = betterAuth({
  trustedOrigins: [
    import.meta.env.VERCEL_URL, // Vercel deployments
    import.meta.env.DEPLOY_URL, // Netlify deployments
  ],
});
```

### Hosting the database on Turso

https://docs.turso.tech/cli/introduction

Install Turso CLI

```sh
brew install tursodatabase/tap/turso
```

Authenticate by logging in

```sh
turso auth signup
```

Create the remote database

```sh
turso db create [your-db-name]
```

Get info about the database

```sh
turso db show [your-db-name]
```

Create app token

```sh
turso db tokens create [your-db-name]
```

Populate the .env file with the info like so:

```
ASTRO_DB_REMOTE_URL=libsql://insert-your-url-here.turso.io
ASTRO_DB_APP_TOKEN=your-token-here
```

Push the database schema to Turso.

```sh
astro db push --remote
```

Update the build command and create a new dev command that's able to use the production database.

```json
{
  "scripts": {
    "dev-remote": "astro dev --remote",
    "build": "astro build --remote"
  }
}
```
