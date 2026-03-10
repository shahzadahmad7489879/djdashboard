"use client";

import { useState, type FormEvent } from "react";

const tipOptions = [0, 5, 10, 20];

export default function RequestPage() {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [tipChoice, setTipChoice] = useState(5);
  const [customTip, setCustomTip] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const resolvedTip = customTip.trim().length
    ? Number.parseFloat(customTip)
    : tipChoice;

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!song.trim()) {
      setError("Please enter a song name.");
      setStatus("error");
      return;
    }

    if (Number.isNaN(resolvedTip) || resolvedTip < 0) {
      setError("Please enter a valid tip amount.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song,
          artist,
          requesterName,
          amount: resolvedTip,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment failed. Please try again.");
      }

      setStatus("success");
      setSong("");
      setArtist("");
      setRequesterName("");
      setCustomTip("");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Payment failed.";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Request A Song
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Make it count on the dance floor.
          </h1>
          <p className="text-[color:var(--muted)]">
            Submit your song request and send a tip. Your request shows up instantly on
            the DJ dashboard.
          </p>
        </header>

        <form
          onSubmit={submitRequest}
          className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)]"
        >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Song name</label>
              <input
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:var(--ring)]"
                value={song}
                onChange={(event) => setSong(event.target.value)}
                placeholder="Song title"
                required
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Artist (optional)</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:var(--ring)]"
                  value={artist}
                  onChange={(event) => setArtist(event.target.value)}
                  placeholder="Artist name"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Your name (optional)</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:var(--ring)]"
                  value={requesterName}
                  onChange={(event) => setRequesterName(event.target.value)}
                  placeholder="Name"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Tip amount</label>
                <span className="text-sm text-[color:var(--muted)]">(simulated payment)</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {tipOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      tipChoice === amount && !customTip
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                    onClick={() => {
                      setTipChoice(amount);
                      setCustomTip("");
                    }}
                  >
                    ${amount}
                  </button>
                ))}
                <input
                  className="w-28 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-[color:var(--accent)]"
                  placeholder="$ Custom"
                  value={customTip}
                  onChange={(event) => setCustomTip(event.target.value)}
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {status === "success" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Request sent. Your DJ has it now.
              </div>
            ) : null}

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Processing payment..." : "Pay & Send Request"}
            </button>
          </div>
        </form>

        <p className="text-sm text-[color:var(--muted)]">
          DJ? Open the dashboard at <a className="font-semibold underline" href="/dashboard">/dashboard</a>.
        </p>
      </main>
    </div>
  );
}
