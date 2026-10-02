/**
 * ZarinPal Payment Gateway API v4 integration
 * Merchant ID: 0ab1f1f5-8a47-4eba-bd1b-70c9dff3cbd9
 */

const ZARINPAL_MERCHANT_ID =
  process.env.ZARINPAL_MERCHANT_ID || "0ab1f1f5-8a47-4eba-bd1b-70c9dff3cbd9";

const ZARINPAL_REQUEST_URL = "https://payment.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_START_PAY_URL = "https://payment.zarinpal.com/pg/StartPay/";
const ZARINPAL_VERIFY_URL = "https://payment.zarinpal.com/pg/v4/payment/verify.json";

export interface RequestPaymentParams {
  amountTomans: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

export interface RequestPaymentResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
  code?: number;
}

export interface VerifyPaymentParams {
  amountTomans: number;
  authority: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  refId?: number | string;
  cardPan?: string;
  code?: number;
  message?: string;
  error?: string;
}

/**
 * Initiates payment request with ZarinPal v4
 */
export async function requestZarinpalPayment(
  params: RequestPaymentParams
): Promise<RequestPaymentResult> {
  const { amountTomans, description, callbackUrl, mobile, email } = params;

  try {
    const payload = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: amountTomans,
      currency: "IRT", // Toman
      description: description || "ثبت‌نام نشست EPD Community",
      callback_url: callbackUrl,
      metadata: {
        mobile: mobile || undefined,
        email: email || undefined,
      },
    };

    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.data && (result.data.code === 100 || result.data.authority)) {
      const authority = result.data.authority;
      return {
        success: true,
        authority,
        paymentUrl: `${ZARINPAL_START_PAY_URL}${authority}`,
        code: result.data.code,
      };
    }

    const errorMessage =
      result.errors?.message ||
      (Array.isArray(result.errors) && result.errors[0]?.message) ||
      `خطای زرین‌پال (کد ${result.data?.code || "نامشخص"})`;

    return {
      success: false,
      code: result.data?.code,
      error: errorMessage,
    };
  } catch (error) {
    console.error("ZarinPal request error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطای ارتباط با درگاه پرداخت",
    };
  }
}

/**
 * Verifies transaction with ZarinPal v4
 */
export async function verifyZarinpalPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  const { amountTomans, authority } = params;

  try {
    const payload = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: amountTomans,
      authority,
    };

    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // Code 100: Payment successful and verified
    // Code 101: Payment already verified
    if (result.data && (result.data.code === 100 || result.data.code === 101)) {
      return {
        success: true,
        refId: result.data.ref_id,
        cardPan: result.data.card_pan,
        code: result.data.code,
        message: result.data.message,
      };
    }

    const errorMessage =
      result.errors?.message ||
      (Array.isArray(result.errors) && result.errors[0]?.message) ||
      `تراکنش ناموفق (کد ${result.data?.code || "خطا"})`;

    return {
      success: false,
      code: result.data?.code,
      error: errorMessage,
    };
  } catch (error) {
    console.error("ZarinPal verify error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطای بررسی وضعیت تراکنش",
    };
  }
}
