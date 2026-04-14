import crypto from "crypto";

const TERMINAL_ID = process.env.ALIF_TERMINAL_ID || "";
const TERMINAL_PASSWORD = process.env.ALIF_TERMINAL_PASSWORD || "";
const TEST_MODE = process.env.ALIF_TEST_MODE === "true";

const ALIF_API_URL = TEST_MODE
  ? "https://test.acquiring.alif.tj"
  : "https://acquiring.alif.tj";

const ALIF_WEB_URL = TEST_MODE
  ? "https://test-web.alif.tj"
  : "https://web.alif.tj";

function hmacSha256(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function buildHashedPassword(): string {
  return hmacSha256(TERMINAL_ID, TERMINAL_PASSWORD);
}

function generateToken(orderId: string, amount: string, callbackUrl: string): string {
  const hashedPassword = buildHashedPassword();
  const dataToSign = TERMINAL_ID + orderId + amount + callbackUrl;
  return hmacSha256(hashedPassword, dataToSign);
}

export function verifyCallbackToken(
  orderId: string,
  status: string,
  transactionId: string,
  receivedToken: string,
): boolean {
  if (!TERMINAL_ID || !TERMINAL_PASSWORD) return false;
  const hashedPassword = buildHashedPassword();
  const dataToSign = orderId + status + transactionId;
  const expected = hmacSha256(hashedPassword, dataToSign);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(receivedToken, "hex"));
  } catch {
    return false;
  }
}

export type AlifStatus =
  | "pending"
  | "to_approve"
  | "ok"
  | "failed"
  | "canceled"
  | "partially_approved"
  | "partially_canceled";

export function normalizeAlifStatus(raw: string | undefined | null): AlifStatus | null {
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim();
  const map: Record<string, AlifStatus> = {
    ok: "ok",
    success: "ok",
    paid: "ok",
    pending: "pending",
    to_approve: "to_approve",
    failed: "failed",
    fail: "failed",
    error: "failed",
    declined: "failed",
    rejected: "failed",
    canceled: "canceled",
    cancelled: "canceled",
    cancel: "canceled",
    partially_approved: "partially_approved",
    partially_canceled: "partially_canceled",
  };
  return map[s] ?? null;
}

export interface PaymentParams {
  orderId: string;
  amount: number;
  gate?: string;
  callbackUrl: string;
  returnUrl: string;
  info?: string;
  email?: string;
  phone?: string;
}

export interface AlifPaymentResult {
  type: "redirect" | "form";
  url?: string;
  formHtml?: string;
}

export async function initiateAlifPayment(params: PaymentParams): Promise<AlifPaymentResult> {
  const { orderId, amount, gate = "vsa", callbackUrl, returnUrl, info, email, phone } = params;

  if (!TERMINAL_ID || !TERMINAL_PASSWORD) {
    throw new Error("ALIF_TERMINAL_ID and ALIF_TERMINAL_PASSWORD must be configured");
  }

  const amountStr = amount.toFixed(2);
  const token = generateToken(orderId, amountStr, callbackUrl);

  const apiBody: Record<string, any> = {
    key: TERMINAL_ID,
    token,
    orderId,
    amount: amountStr,
    callbackUrl,
    returnUrl,
    gate,
  };
  if (info) apiBody.info = info;
  if (email) apiBody.email = email;
  if (phone) apiBody.phone = phone;

  console.log(`[alif] Initiating: orderId=${orderId} amount=${amountStr} gate=${gate} mode=${TEST_MODE ? "TEST" : "PROD"}`);

  try {
    const response = await fetch(`${ALIF_API_URL}/v2/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", gate },
      body: JSON.stringify(apiBody),
    });

    const rawText = await response.text();
    console.log(`[alif] API HTTP ${response.status}: ${rawText.slice(0, 300)}`);

    if (response.ok || response.status === 208) {
      let data: any;
      try { data = JSON.parse(rawText); } catch { data = null; }

      if (data?.code === 208) {
        console.log(`[alif] Duplicate orderId=${orderId}, existing payment detected`);
        throw new Error("DUPLICATE_ORDER");
      }

      if (data?.code === 200 && data?.url) {
        console.log(`[alif] API success, redirect to: ${data.url}`);
        return { type: "redirect", url: data.url };
      }
    }

    console.log(`[alif] API failed (${response.status}), falling back to form`);
  } catch (err: any) {
    if (err.message === "DUPLICATE_ORDER") throw err;
    console.log(`[alif] API error: ${err.message}, falling back to form`);
  }

  const formData: Record<string, string> = {
    key: TERMINAL_ID,
    token,
    orderId,
    amount: amountStr,
    callbackUrl,
    returnUrl,
    gate,
  };
  if (info) formData.info = info;
  if (email) formData.email = email;
  if (phone) formData.phone = phone;

  const fields = Object.entries(formData)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}" />`)
    .join("\n");

  const formHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Переход к оплате...</title></head><body>
    <form id="alifForm" method="POST" action="${ALIF_WEB_URL}/">${fields}</form>
    <p style="text-align:center;margin-top:50px;font-family:sans-serif;">Переход к оплате...</p>
    <script>document.getElementById("alifForm").submit();</script>
  </body></html>`;

  return { type: "form", formHtml };
}

export interface CheckTxnParams {
  orderId: string;
}

export async function checkAlifTransaction(params: CheckTxnParams): Promise<any> {
  const { orderId } = params;
  const hashedPassword = buildHashedPassword();
  const token = hmacSha256(hashedPassword, TERMINAL_ID + orderId);

  const body = {
    orderId,
    key: TERMINAL_ID,
    token,
  };

  const response = await fetch(`${ALIF_WEB_URL}/checktxn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
}
