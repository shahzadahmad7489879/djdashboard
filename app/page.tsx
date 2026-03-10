export default function Home() {
  return (
    <div className="min-h-screen px-6 py-12">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            DJ Request Board
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Scan. Request. Pay. Play.
          </h1>
          <p className="max-w-2xl text-lg text-[color:var(--muted)] sm:text-xl">
            A lightweight request flow for your crowd and a clean dashboard for you.
            Keep it simple and keep the dance floor moving.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-[color:var(--panel)] p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-semibold">Audience Request</h2>
            <p className="mt-3 text-[color:var(--muted)]">
              Share the QR code so guests can request songs and send a tip in seconds.
            </p>
            <a
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
              href="/request"
            >
              Open Request Page
            </a>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-semibold">DJ Dashboard</h2>
            <p className="mt-3 text-[color:var(--muted)]">
              See paid requests in real-time, mark songs as played, and keep track of tips.
            </p>
            <a
              className="mt-6 inline-flex items-center justify-center rounded-full border border-black/15 px-5 py-3 text-sm font-semibold transition hover:border-black/30 hover:bg-black/5"
              href="/dashboard"
            >
              Open Dashboard
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
