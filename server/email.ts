import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "info@nexttour.tj";
const FROM_NAME = "NEXT TOUR";
const APP_URL = process.env.APP_URL || "https://nexttour.tj";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const brandColor = "#0b1f3a";
const accentColor = "#3b82f6";

function isConfigured() {
  if (!resend) {
    console.log("[email] Resend API key not configured.");
    return false;
  }
  return true;
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const { error } = await resend!.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    console.log(`[email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err: any) {
    console.error("[email] Resend exception:", err);
    return false;
  }
}

function header(subtitle: string) {
  return `
    <div style="background:linear-gradient(135deg,${brandColor} 0%,#1e3a5f 100%);padding:36px 32px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:.08em;">NEXT TOUR</h1>
      <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px;">${subtitle}</p>
    </div>`;
}

function footer() {
  return `
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 20px;">
    <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
      © 2026 NEXT TOUR · <a href="${APP_URL}" style="color:#94a3b8;">nexttour.tj</a>
    </p>`;
}

function wrap(body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;">${body}</div>`;
}

export async function sendVerificationEmail(toEmail: string, name: string, verifyUrl: string): Promise<boolean> {
  const html = wrap(`
    ${header("Подтверждение email")}
    <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <h2 style="color:${brandColor};margin:0 0 16px;">Подтвердите ваш email, ${name}!</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
        Спасибо за регистрацию в NEXT TOUR! Нажмите кнопку ниже, чтобы подтвердить ваш email и активировать аккаунт.
      </p>
      <a href="${verifyUrl}"
         style="display:inline-block;background:${accentColor};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Подтвердить email →
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
        Если вы не регистрировались в NEXT TOUR — просто проигнорируйте это письмо.
      </p>
      ${footer()}
    </div>
  `);
  return send(toEmail, "NEXT TOUR — Подтвердите ваш email ✉️", html);
}

export async function sendWelcomeEmail(toEmail: string, name: string): Promise<boolean> {
  const html = wrap(`
    ${header("Откройте мир путешествий")}
    <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <h2 style="color:${brandColor};margin:0 0 16px;">Добро пожаловать, ${name}!</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 16px;">
        Рады приветствовать вас в NEXT TOUR — вашем надёжном проводнике в мире путешествий.
      </p>
      <ul style="color:#475569;line-height:2;padding-left:20px;margin:0 0 24px;">
        <li>Бронирование туров онлайн</li>
        <li>Программа лояльности и скидки</li>
        <li>История ваших путешествий</li>
        <li>Персональные предложения</li>
      </ul>
      <a href="${APP_URL}/tours"
         style="display:inline-block;background:${accentColor};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Выбрать тур →
      </a>
      ${footer()}
    </div>
  `);
  return send(toEmail, "Добро пожаловать в NEXT TOUR! 🌍", html);
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
  const html = wrap(`
    ${header("Сброс пароля")}
    <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <h2 style="color:${brandColor};margin:0 0 16px;">Сброс пароля</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
        Вы запросили сброс пароля. Нажмите кнопку ниже, чтобы задать новый пароль.
        Ссылка действительна в течение <strong>1 часа</strong>.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;background:${accentColor};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Сбросить пароль →
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
        Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.
      </p>
      ${footer()}
    </div>
  `);
  return send(toEmail, "NEXT TOUR — Сброс пароля", html);
}

export async function sendBookingConfirmationEmail(opts: {
  toEmail: string;
  name: string;
  tourTitle: string;
  bookingId: string;
  adults: number;
  children: number;
  totalPrice: string;
  startDate?: string;
  endDate?: string;
}): Promise<boolean> {
  const { toEmail, name, tourTitle, bookingId, adults, children, totalPrice, startDate, endDate } = opts;

  const dateRow = startDate && endDate
    ? `<tr><td style="color:#64748b;padding:6px 0;">Даты</td><td style="font-weight:600;padding:6px 0;">${startDate} — ${endDate}</td></tr>`
    : "";
  const childRow = children > 0
    ? `<tr><td style="color:#64748b;padding:6px 0;">Дети</td><td style="font-weight:600;padding:6px 0;">${children}</td></tr>`
    : "";

  const html = wrap(`
    ${header("Подтверждение бронирования")}
    <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <h2 style="color:${brandColor};margin:0 0 8px;">Ваше бронирование принято! ✈️</h2>
      <p style="color:#475569;margin:0 0 24px;">Привет, ${name}! Спасибо за выбор NEXT TOUR. Детали вашего тура:</p>

      <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="font-size:18px;font-weight:700;color:${brandColor};margin:0 0 16px;">${tourTitle}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${dateRow}
          <tr><td style="color:#64748b;padding:6px 0;">Взрослые</td><td style="font-weight:600;padding:6px 0;">${adults}</td></tr>
          ${childRow}
          <tr><td style="color:#64748b;padding:6px 0;">Номер бронирования</td><td style="font-weight:600;padding:6px 0;font-family:monospace;">#${bookingId.slice(0, 8).toUpperCase()}</td></tr>
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="color:#64748b;padding:10px 0 6px;font-weight:600;">Итого к оплате</td>
            <td style="font-size:18px;font-weight:700;color:${accentColor};padding:10px 0 6px;">${totalPrice} TJS</td>
          </tr>
        </table>
      </div>

      <p style="color:#475569;margin:0 0 20px;font-size:14px;line-height:1.6;">
        Наш менеджер свяжется с вами в течение 2 часов для подтверждения и уточнения деталей.
        Если у вас есть вопросы — напишите нам в WhatsApp.
      </p>

      <a href="https://wa.me/992885260101"
         style="display:inline-block;background:#25D366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin-right:12px;">
        WhatsApp →
      </a>
      <a href="${APP_URL}/profile"
         style="display:inline-block;background:${accentColor};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
        Мои бронирования →
      </a>
      ${footer()}
    </div>
  `);

  return send(toEmail, `NEXT TOUR — Бронирование тура: ${tourTitle}`, html);
}

export async function sendBulkEmail(opts: {
  recipients: Array<{ email: string; name: string }>;
  subject: string;
  html: string;
}): Promise<{ sent: number; failed: number }> {
  if (!isConfigured()) return { sent: 0, failed: opts.recipients.length };

  const fullHtml = wrap(`
    ${header("Специальное предложение")}
    <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      ${opts.html}
      ${footer()}
    </div>
  `);

  let sent = 0;
  let failed = 0;

  // Resend supports batch sending up to 100 per request
  const BATCH = 100;
  for (let i = 0; i < opts.recipients.length; i += BATCH) {
    const batch = opts.recipients.slice(i, i + BATCH);
    try {
      const emails = batch.map(r => ({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: r.email,
        subject: opts.subject,
        html: fullHtml,
      }));
      const { error } = await resend!.batch.send(emails);
      if (error) {
        console.error("[email] Bulk send error:", error);
        failed += batch.length;
      } else {
        sent += batch.length;
      }
    } catch (err: any) {
      console.error("[email] Bulk send exception:", err);
      failed += batch.length;
    }
  }

  console.log(`[email] Bulk: sent=${sent}, failed=${failed}`);
  return { sent, failed };
}
