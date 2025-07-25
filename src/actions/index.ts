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

        if (name !== session.user.name) {
          await auth.api.updateUser({
            body: {
              name: name,
            },
            headers: context.request.headers,
          });
        }

        if (email !== session.user.email) {
          await auth.api.changeEmail({
            body: {
              newEmail: email,
            },
            headers: context.request.headers,
          });
        }

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
            callbackURL: "/",
          },
          headers: context.request.headers,
        });

        return {
          success: true,
          message: "Account deleted successfully.",
        };
      } catch (error) {
        console.error("Account deletion error:", error);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while deleting your account.",
        });
      }
    },
  }),
};
