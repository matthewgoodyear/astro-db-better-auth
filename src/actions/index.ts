import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { sendEmail } from "@/lib/email";

export const server = {
  sendEmail: defineAction({
    input: z.object({
      to: z.string(),
      subject: z.string(),
      text: z.string(),
    }),
    handler: async ({ to, subject, text }) => {
      try {
        const data = await sendEmail({ to, subject, text });
        return data;
      } catch (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error.message, // TODO fix this type error
        });
      }
    },
  }),
};
