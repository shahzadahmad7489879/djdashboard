import { NextResponse } from "next/server";
import { buildIpsDeepLink, buildIpsPayload, buildPaymentDescription } from "@/lib/ips";
import { createPaymentIntent, listPaidRequests } from "@/lib/requests";

export const runtime = "nodejs";

const allowedAmounts = new Set([500, 1000, 2000]);

export async function GET() {
  const items = await listPaidRequests();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const song = typeof body.song === "string" ? body.song.trim() : "";
    const artist = typeof body.artist === "string" ? body.artist.trim() : "";
    const amountRaw = Number(body.amount ?? 0);
    const amount = Number.isFinite(amountRaw) ? Math.round(amountRaw) : 0;

    if (!song) {
      return NextResponse.json({ error: "Song name is required." }, { status: 400 });
    }

    if (!artist) {
      return NextResponse.json({ error: "Artist is required." }, { status: 400 });
    }

    if (!allowedAmounts.has(amount)) {
      return NextResponse.json(
        { error: "Please select a valid amount." },
        { status: 400 }
      );
    }

    const intent = await createPaymentIntent({ song, artist, amount });
    const description = buildPaymentDescription(song, artist);
    const payload = buildIpsPayload({ amountRsd: amount, description });
    const paymentUrl = buildIpsDeepLink(payload);

    return NextResponse.json({ intentId: intent.id, paymentUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
