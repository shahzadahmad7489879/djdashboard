import { NextResponse } from "next/server";
import { createRequest, listRequests } from "@/lib/requests";

export const runtime = "nodejs";

export async function GET() {
  const items = await listRequests();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const song = typeof body.song === "string" ? body.song.trim() : "";
    const artist = typeof body.artist === "string" ? body.artist.trim() : undefined;
    const requesterName =
      typeof body.requesterName === "string" ? body.requesterName.trim() : undefined;
    const amountRaw = Number(body.amount ?? 0);
    const amount = Number.isFinite(amountRaw)
      ? Math.max(0, Math.round(amountRaw * 100) / 100)
      : 0;

    if (!song) {
      return NextResponse.json({ error: "Song name is required." }, { status: 400 });
    }

    const item = await createRequest({ song, artist, requesterName, amount });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
