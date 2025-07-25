import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "@/lib/auth";
import { Account, db, and, eq, User } from "astro:db";

export const server = {
  // Sign-up
  signUp: defineAction({
    accept: "form",
    input: z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    }),
    handler: async ({ name, email, password }) => {
      try {
        await auth.api.signUpEmail({
          body: {
            name,
            email,
            password,
          },
        });

        return {
          success: true,
          message: "Check your inbox to verify your email.",
        };
      } catch (error) {
        console.error("Sign up error:", error);

        throw new ActionError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Sign up failed. Please try again.",
        });
      }
    },
  }),

  updateUser: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }),
    handler: async ({ name, email }, context) => {
      try {
        const session = await auth.api.getSession({
          headers: context.request.headers,
        });

        if (!session?.user) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must be signed in to update your account.",
          });
        }

        const newData = {
          name: name,
          email: email,
          updatedAt: new Date().toISOString(),
        };

        await db.update(User).set(newData).where(eq(User.id, session.user.id));

        return {
          success: true,
          message: "Account updated successfully.",
        };
      } catch (error) {
        console.error("Update user error:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while updating the account.",
        });
      }
    },
  }),

  // Update password
  updatePassword: defineAction({
    accept: "form",
    input: z.object({
      currentPassword: z.string(),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    }),
    handler: async ({ currentPassword, newPassword }, context) => {
      try {
        // 1. Get user session from request headers
        const session = await auth.api.getSession({
          headers: context.request.headers,
        });

        if (!session?.user) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must be signed in to update your password.",
          });
        }

        const userId = session.user.id;
        const authCtx = await auth.$context;

        // 2. Fetch the password-based account from Astro DB (Drizzle)
        const [account] = await db
          .select()
          .from(Account)
          .where(
            and(
              eq(Account.userId, userId),
              eq(Account.providerId, "credential"),
            ),
          );

        if (!account?.password) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Password-based account not found.",
          });
        }

        // 3. Verify current password matches
        const isMatch = await authCtx.password.verify({
          hash: account.password,
          password: currentPassword,
        });

        if (!isMatch) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Current password is incorrect.",
          });
        }

        // 4. Hash and update to the new password
        const hashedPassword = await authCtx.password.hash(newPassword);

        await authCtx.internalAdapter.updatePassword(userId, hashedPassword);

        return {
          success: true,
          message: "Password updated successfully.",
        };
      } catch (error) {
        console.error("Password update error:", error);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while updating the password.",
        });
      }
    },
  }),
};
