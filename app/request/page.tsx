"use client";

import { useState, type FormEvent } from "react";

const amounts = [500, 1000, 2000];

export default function RequestPage() {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [amount, setAmount] = useState(500);
  const [status, setStatus] = useState<"idle" | "loading" | "redirecting" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!song.trim()) {
      setError("Enter a song name.");
      setStatus("error");
      return;
    }

    if (!artist.trim()) {
      setError("Enter an artist name.");
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
          amount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Payment could not be started.");
      }

      if (!data.paymentUrl) {
        throw new Error("Payment link unavailable.");
      }

      setPaymentUrl(data.paymentUrl);
      setStatus("redirecting");
      window.location.href = data.paymentUrl as string;
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Payment could not be started.";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="Club logo" className="h-16 w-auto" />
        </div>

        <form onSubmit={submitRequest} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Song Name</label>
            <input
              className="w-full rounded-xl border border-white/20 bg-[#0b0b0b] px-4 py-4 text-base text-white outline-none"
              value={song}
              onChange={(event) => setSong(event.target.value)}
              placeholder="Enter song name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Artist</label>
            <input
              className="w-full rounded-xl border border-white/20 bg-[#0b0b0b] px-4 py-4 text-base text-white outline-none"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Enter artist"
              required
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Select Amount</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {amounts.map((value) => {
                const isSelected = amount === value;
                const base =
                  value === 500
                    ? "bg-[#6C757D]"
                    : value === 1000
                    ? "bg-[#0D6EFD]"
                    : "bg-[#FFD700]";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value)}
                    className={`rounded-xl px-4 py-5 text-lg font-semibold text-white ${base} ${
                      isSelected ? "ring-4 ring-white/40" : "opacity-80"
                    }`}
                  >
                    {value} RSD
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          {status === "redirecting" ? (
            <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
              Opening your banking app... If it doesn't open, tap the button below.
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-6 py-4 text-lg font-semibold text-black"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Starting payment..." : "PAY"}
          </button>

          {paymentUrl && status === "redirecting" ? (
            <a
              className="w-full rounded-xl border border-white/30 px-6 py-4 text-center text-sm font-semibold"
              href={paymentUrl}
            >
              Open Banking App
            </a>
          ) : null}
        </form>
      </main>
    </div>
  );
}
