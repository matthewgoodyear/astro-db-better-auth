import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "@/lib/auth";
import { Account, db, eq, User } from "astro:db";
import { APIError } from "better-auth/api";

export const server = {
  // Sign-up
  signUp: defineAction({
    accept: "form",
    input: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8).max(32),
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
        throw new ActionError({
          code: "BAD_REQUEST",
          message:
            error instanceof APIError
              ? error.message
              : "Sign up failed. Please try again.",
        });
      }
    },
  }),

  // Sign-in
  signIn: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    handler: async ({ email, password }, context) => {
      try {
        const response = await auth.api.signInEmail({
          body: {
            email,
            password,
            rememberMe: true,
          },
          headers: context.request.headers,
          asResponse: true,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: errorData.message,
          });
        }

        return {
          success: true,
          message: "Signed-in successfully.",
          cookies: response.headers.getSetCookie(),
        };
      } catch (error) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message:
            error instanceof APIError
              ? error.message
              : "Something went wrong while signing in.",
        });
      }
    },
  }),

  // Update user
  updateUser: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(2),
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

        if (name !== session.user.name) {
          await auth.api.updateUser({
            body: {
              name: name,
            },
            headers: context.request.headers,
          });

          await db
            .update(User)
            .set({ updatedAt: new Date() })
            .where(eq(User.id, session.user.id));
        }

        if (email !== session.user.email) {
          await auth.api.changeEmail({
            body: {
              newEmail: email,
            },
            headers: context.request.headers,
          });

          await db
            .update(User)
            .set({ updatedAt: new Date() })
            .where(eq(User.id, session.user.id));
        }

        return {
          success: true,
          message: "Account updated successfully.",
        };
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof APIError
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
      newPassword: z.string().min(8).max(32),
    }),
    handler: async ({ currentPassword, newPassword }, context) => {
      try {
        const session = await auth.api.getSession({
          headers: context.request.headers,
        });

        if (!session?.user) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must be signed in to update your password.",
          });
        }

        if (currentPassword === newPassword) {
          throw new ActionError({
            code: "CONFLICT",
            message: "The new password can't be the same as the old password.",
          });
        }

        await auth.api.changePassword({
          body: {
            newPassword: newPassword,
            currentPassword: currentPassword,
          },
          headers: context.request.headers,
        });

        await db
          .update(Account)
          .set({ updatedAt: new Date() })
          .where(eq(Account.userId, session.user.id));

        return {
          success: true,
          message: "Password updated successfully.",
        };
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof APIError
              ? error.message
              : "Something went wrong while updating the password.",
        });
      }
    },
  }),

  // Delete account
  deleteAccount: defineAction({
    accept: "form",
    input: z.object({
      password: z.string(),
      confirmation: z.boolean(),
    }),
    handler: async ({ password, confirmation }, context) => {
      try {
        const session = await auth.api.getSession({
          headers: context.request.headers,
        });

        if (!session?.user) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must be signed in to delete your account.",
          });
        }

        if (!confirmation) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You must confirm you want to delete your account.",
          });
        }

        await auth.api.deleteUser({
          body: {
            password: password,
          },
          headers: context.request.headers,
        });

        return {
          success: true,
          message: "Account deleted successfully.",
        };
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof APIError
              ? error.message
              : "Something went wrong while deleting your account.",
        });
      }
    },
  }),
};
