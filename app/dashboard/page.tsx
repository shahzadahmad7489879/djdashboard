"use client";

import { useEffect, useState } from "react";

type RequestItem = {
  id: string;
  song: string;
  artist?: string;
  amount: number;
  createdAt: string;
};

const moneyFormatter = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "RSD",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">DJ Dashboard</p>
          <h1 className="text-3xl font-semibold">Paid Song Requests</h1>
          <p className="text-sm text-white/60">
            Auto-refreshing every 2 seconds.
            {lastUpdated
              ? ` Last update ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}.`
              : ""}
          </p>
        </header>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm">
            Loading requests...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        {!loading && requests.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm">
            No paid requests yet.
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {requests.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    {item.song}
                    {item.artist ? ` - ${item.artist}` : ""}
                  </p>
                  <p className="text-xs text-white/60">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  {moneyFormatter.format(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
