import { NextResponse } from "next/server";
import { markPaymentPaid } from "@/lib/requests";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "PAYMENT_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const provided = request.headers.get("x-webhook-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const intentId = typeof body.intentId === "string" ? body.intentId.trim() : "";
    const status = typeof body.status === "string" ? body.status : "";
    const bankReference =
      typeof body.bankReference === "string" ? body.bankReference.trim() : undefined;

    if (!intentId || status !== "paid") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const requestItem = await markPaymentPaid(intentId, bankReference);
    if (!requestItem) {
      return NextResponse.json({ error: "Payment intent not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, request: requestItem });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
