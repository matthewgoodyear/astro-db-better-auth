import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const resendEmail = import.meta.env.RESEND_EMAIL;

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const { data, error } = await resend.emails.send({
    from: `Better Auth <${resendEmail}>`,
    to,
    subject,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
