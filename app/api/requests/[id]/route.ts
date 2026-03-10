import { NextResponse } from "next/server";
import { deleteRequest, updateRequest } from "@/lib/requests";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : undefined;
    const allowedStatuses = new Set(["paid", "played", "cancelled"]);

    if (status && !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const amountRaw = body.amount !== undefined ? Number(body.amount) : undefined;
    const amount =
      amountRaw !== undefined && Number.isFinite(amountRaw)
        ? Math.max(0, Math.round(amountRaw * 100) / 100)
        : undefined;

    const patch: Parameters<typeof updateRequest>[1] = {};

    if (status) {
      patch.status = status as "paid" | "played" | "cancelled";
    }
    if (typeof body.song === "string") {
      patch.song = body.song;
    }
    if (typeof body.artist === "string") {
      patch.artist = body.artist;
    }
    if (typeof body.requesterName === "string") {
      patch.requesterName = body.requesterName;
    }
    if (amount !== undefined) {
      patch.amount = amount;
    }

    const updated = await updateRequest(id, patch);

    if (!updated) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const deleted = await deleteRequest(id);
  if (!deleted) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
