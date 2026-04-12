import crypto from "crypto";

const TERMINAL_ID = process.env.ALIF_TERMINAL_ID || "";
const TERMINAL_PASSWORD = process.env.ALIF_TERMINAL_PASSWORD || "";
const TEST_MODE = process.env.ALIF_TEST_MODE !== "false";
const BASE_URL = TEST_MODE
  ? "https://test.acquiring.alif.tj"
  : "https://acquiring.alif.tj";

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
  amount: number,
  callbackUrl: string,
  incomingToken: string
): boolean {
  const expected = generateToken(orderId, amount.toFixed(2), callbackUrl);
  return expected === incomingToken;
}

export interface InitiatePaymentParams {
  orderId: string;
  amount: number;
  gate?: string;
  callbackUrl: string;
  returnUrl: string;
  info?: string;
  email?: string;
  phone?: string;
}

export interface AlifInitResponse {
  code: number;
  message: string;
  url?: string;
}

export async function initiateAlifPayment(params: InitiatePaymentParams): Promise<AlifInitResponse> {
  const { orderId, amount, gate = "visa_mastercard", callbackUrl, returnUrl, info, email, phone } = params;

  if (!TERMINAL_ID || !TERMINAL_PASSWORD) {
    throw new Error("ALIF_TERMINAL_ID and ALIF_TERMINAL_PASSWORD must be configured");
  }

  const amountStr = amount.toFixed(2);
  const token = generateToken(orderId, amountStr, callbackUrl);

  const body: Record<string, any> = {
    order_id: orderId,
    token,
    key: TERMINAL_ID,
    callback_url: callbackUrl,
    return_url: returnUrl,
    amount: amountStr,
    gate,
  };
  if (info) body.info = info;
  if (email) body.email = email;
  if (phone) body.phone = phone;

  console.log(`[alif] Initiating payment orderId=${orderId} amount=${amountStr} gate=${gate} env=${TEST_MODE ? "test" : "prod"}`);

  const response = await fetch(`${BASE_URL}/v2/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "gate": gate,
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  console.log(`[alif] HTTP status: ${response.status}`);
  console.log(`[alif] Raw response: ${rawText.slice(0, 500)}`);

  let data: AlifInitResponse;
  try {
    data = JSON.parse(rawText) as AlifInitResponse;
  } catch {
    throw new Error(`Alif API returned non-JSON (HTTP ${response.status}): ${rawText.slice(0, 200)}`);
  }

  console.log(`[alif] Response: code=${data.code} message=${data.message}`);
  return data;
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

  const response = await fetch(`${BASE_URL}/checktxn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
}
