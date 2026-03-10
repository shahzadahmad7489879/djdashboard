"use client";

import { useEffect, useMemo, useState } from "react";

type RequestItem = {
  id: string;
  song: string;
  artist?: string;
  requesterName?: string;
  amount: number;
  status: "paid" | "played" | "cancelled";
  createdAt: string;
};

const statusStyles: Record<RequestItem["status"], string> = {
  paid: "bg-amber-100 text-amber-800 border-amber-200",
  played: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [requestUrl, setRequestUrl] = useState("");

  const totalTips = useMemo(
    () => requests.reduce((sum, item) => sum + (item.amount || 0), 0),
    [requests]
  );
  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === "paid").length,
    [requests]
  );

  const loadRequests = async () => {
    try {
      setError("");
      const response = await fetch("/api/requests", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load requests.");
      }
      const data = await response.json();
      setRequests(Array.isArray(data.items) ? data.items : []);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load requests.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: RequestItem["status"]) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadRequests();
  };

  const removeRequest = async (id: string) => {
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
    await loadRequests();
  };

  const copyUrl = async () => {
    if (!requestUrl) return;
    await navigator.clipboard.writeText(requestUrl);
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (requestUrl) return;
    const fromEnv = process.env.NEXT_PUBLIC_REQUEST_URL;
    if (fromEnv && fromEnv.length > 0) {
      setRequestUrl(fromEnv);
      return;
    }
    if (typeof window !== "undefined") {
      setRequestUrl(`${window.location.origin}/request`);
    }
  }, [requestUrl]);

  const qrSrc = requestUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        requestUrl
      )}`
    : "";

  return (
    <div className="min-h-screen px-6 py-10">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            DJ Dashboard
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">Tonight's Requests</h1>
            <button
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-black/30 hover:bg-black/5"
              onClick={loadRequests}
            >
              Refresh
            </button>
          </div>
          <p className="text-[color:var(--muted)]">
            Auto-refreshes every 5 seconds.
            {lastUpdated
              ? ` Last update ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}.`
              : ""}
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.5)]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-[color:var(--panel)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Total Requests
                </p>
                <p className="mt-2 text-3xl font-semibold">{requests.length}</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-[color:var(--panel)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-[color:var(--panel)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Tips
                </p>
                <p className="mt-2 text-3xl font-semibold">{moneyFormatter.format(totalTips)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-6 text-sm text-[color:var(--muted)]">
                  Loading requests...
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {!loading && requests.length === 0 ? (
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-6 text-sm text-[color:var(--muted)]">
                  No requests yet. Share the QR code and watch this fill up.
                </div>
              ) : null}

              {requests.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-black/10 bg-white px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {item.song}
                        {item.artist ? ` — ${item.artist}` : ""}
                      </h3>
                      <p className="text-sm text-[color:var(--muted)]">
                        {item.requesterName ? `Requested by ${item.requesterName}` : "Guest"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {moneyFormatter.format(item.amount || 0)}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        statusStyles[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.status !== "played" ? (
                        <button
                          className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold transition hover:border-black/30 hover:bg-black/5"
                          onClick={() => updateStatus(item.id, "played")}
                        >
                          Mark Played
                        </button>
                      ) : (
                        <button
                          className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold transition hover:border-black/30 hover:bg-black/5"
                          onClick={() => updateStatus(item.id, "paid")}
                        >
                          Move Back
                        </button>
                      )}
                      <button
                        className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                        onClick={() => removeRequest(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-black/10 bg-[color:var(--panel)] p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.4)]">
            <h2 className="text-2xl font-semibold">Audience QR Code</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Print or share this QR code so guests can open the request form.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white p-6">
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt="Request QR code"
                  className="h-48 w-48 rounded-xl border border-black/10 bg-white"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-black/10 text-sm text-[color:var(--muted)]">
                  Generating QR...
                </div>
              )}
              <div className="w-full">
                <p className="break-all text-xs text-[color:var(--muted)]">{requestUrl}</p>
                <button
                  className="mt-3 w-full rounded-full border border-black/10 px-3 py-2 text-xs font-semibold transition hover:border-black/30 hover:bg-black/5"
                  onClick={copyUrl}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
