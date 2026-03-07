import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "noreply@travelpro.ru";

  if (!host || !user || !pass) {
    return null;
  }

  return { transport: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
  const config = createTransport();

  if (!config) {
    console.log(`[email] SMTP not configured. Password reset link for ${toEmail}: ${resetUrl}`);
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0b1f3a;">TravelPro — Сброс пароля</h2>
      <p>Вы запросили сброс пароля для вашей учётной записи TravelPro.</p>
      <p>Нажмите на кнопку ниже, чтобы задать новый пароль. Ссылка действительна в течение 1 часа.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#0b1f3a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Сбросить пароль
      </a>
      <p style="color:#666;font-size:13px;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#999;font-size:12px;">TravelPro — Ваш надёжный туроператор</p>
    </div>
  `;

  try {
    await config.transport.sendMail({
      from: config.from,
      to: toEmail,
      subject: "TravelPro — Сброс пароля",
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
    return false;
  }
}
