import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "noreply@nexttour.ru";

  if (!host || !user || !pass) {
    return null;
  }

  return { transport: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

const brandColor = "#0b1f3a";
const accentColor = "#3b82f6";

export async function sendWelcomeEmail(toEmail: string, name: string): Promise<boolean> {
  const config = createTransport();

  if (!config) {
    console.log(`[email] SMTP not configured. Welcome email for ${toEmail} skipped.`);
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, ${brandColor} 0%, #1e3a5f 100%); padding: 40px 32px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 0.08em;">NEXT TOUR</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">Откройте мир путешествий</p>
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <h2 style="color: ${brandColor}; margin: 0 0 16px;">Добро пожаловать, ${name}! 🌍</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 16px;">
          Рады приветствовать вас в NEXT TOUR — вашем надёжном проводнике в мире путешествий.
          Теперь вам доступны все возможности нашего сервиса:
        </p>
        <ul style="color: #475569; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
          <li>Бронирование туров онлайн</li>
          <li>Программа лояльности и скидки</li>
          <li>История ваших путешествий</li>
          <li>Персональные предложения</li>
        </ul>
        <a href="${process.env.APP_URL || "https://nexttour.ru"}/tours"
           style="display:inline-block;background:${accentColor};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
          Выбрать тур →
        </a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 24px;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          Если вы не регистрировались на NEXT TOUR, просто проигнорируйте это письмо.
        </p>
      </div>
    </div>
  `;

  try {
    await config.transport.sendMail({
      from: `"NEXT TOUR" <${config.from}>`,
      to: toEmail,
      subject: "Добро пожаловать в NEXT TOUR! 🌍",
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] Failed to send welcome email:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
  const config = createTransport();

  if (!config) {
    console.log(`[email] SMTP not configured. Password reset link for ${toEmail}: ${resetUrl}`);
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, ${brandColor} 0%, #1e3a5f 100%); padding: 40px 32px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 0.08em;">NEXT TOUR</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">Сброс пароля</p>
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <h2 style="color: ${brandColor}; margin: 0 0 16px;">Сброс пароля</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
          Вы запросили сброс пароля. Нажмите кнопку ниже, чтобы задать новый пароль.
          Ссылка действительна в течение <strong>1 часа</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:${accentColor};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
          Сбросить пароль →
        </a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 24px;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо. Ваш пароль останется прежним.
        </p>
      </div>
    </div>
  `;

  try {
    await config.transport.sendMail({
      from: `"NEXT TOUR" <${config.from}>`,
      to: toEmail,
      subject: "NEXT TOUR — Сброс пароля",
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
    return false;
  }
}
