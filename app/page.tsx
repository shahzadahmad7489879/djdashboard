export default function Home() {
  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white">
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <img src="/logo.png" alt="Club logo" className="h-16 w-auto" />
        <div className="flex w-full flex-col gap-3">
          <a
            className="w-full rounded-xl bg-white px-6 py-4 text-center text-lg font-semibold text-black"
            href="/request"
          >
            Guest Request Page
          </a>
          <a
            className="w-full rounded-xl border border-white/30 px-6 py-4 text-center text-lg font-semibold"
            href="/dashboard"
          >
            DJ Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
