import crypto from "crypto";

const TERMINAL_ID = process.env.ALIF_TERMINAL_ID || "";
const TERMINAL_PASSWORD = process.env.ALIF_TERMINAL_PASSWORD || "";

const ALIF_FORM_URL = "https://web.alif.tj/";

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

export interface BuildFormParams {
  orderId: string;
  amount: number;
  gate?: string;
  callbackUrl: string;
  returnUrl: string;
  info?: string;
  email?: string;
  phone?: string;
}

export interface AlifFormData {
  method: "POST";
  action: string;
  formData: Record<string, string>;
}

export function buildAlifFormData(params: BuildFormParams): AlifFormData {
  const { orderId, amount, gate = "vsa", callbackUrl, returnUrl, info, email, phone } = params;

  if (!TERMINAL_ID || !TERMINAL_PASSWORD) {
    throw new Error("ALIF_TERMINAL_ID and ALIF_TERMINAL_PASSWORD must be configured");
  }

  const amountStr = amount.toFixed(2);
  const token = generateToken(orderId, amountStr, callbackUrl);

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

  console.log(`[alif] Form data prepared: orderId=${orderId} amount=${amountStr} gate=${gate}`);

  return {
    method: "POST",
    action: ALIF_FORM_URL,
    formData,
  };
}

export interface CheckTxnParams {
  orderId: string;
  amount: number;
  callbackUrl: string;
}

export async function checkAlifTransaction(params: CheckTxnParams): Promise<any> {
  const { orderId, amount, callbackUrl } = params;
  const amountStr = amount.toFixed(2);
  const token = generateToken(orderId, amountStr, callbackUrl);

  const body = {
    order_id: orderId,
    token,
    key: TERMINAL_ID,
    amount: amountStr,
    callback_url: callbackUrl,
  };

  const response = await fetch(`https://acquiring.alif.tj/checktxn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
}
