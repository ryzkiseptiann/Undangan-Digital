export default function LoadingInvitation() {
  return (
    <main className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-luxury-dark px-6 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,22,17,0.2),rgba(45,22,17,0.97))]" />
      <div className="absolute inset-0 opacity-[0.07] animate-pulse bg-[linear-gradient(135deg,#dfb09e_0%,transparent_55%)]" />

      <div className="relative flex flex-col items-center text-center gap-0">
        {/* Spinning monogram ring — matches CircularMonogram */}
        <div className="relative mb-6 h-20 w-20 sm:h-24 sm:w-24">
          <svg
            className="absolute inset-0 animate-spin pointer-events-none"
            style={{ animationDuration: "3.5s" }}
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle cx="50" cy="50" r="44" stroke="#dfb09e" strokeWidth="0.5" strokeOpacity="0.15" />
            <path
              d="M50 6 A44 44 0 0 1 94 50"
              stroke="#dfb09e"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
          </svg>
          {/* Center initials placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-12 rounded-full bg-rust-300/15 animate-pulse" />
          </div>
        </div>

        {/* Label */}
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.48em] text-rust-300/50">
          Memuat Undangan
        </p>

        {/* Skeleton nama mempelai */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <div className="h-7 w-52 rounded-full bg-rust-300/10 animate-pulse" />
          <span className="font-serif text-xl text-rust-300/20 leading-none">&amp;</span>
          <div className="h-7 w-44 rounded-full bg-rust-300/10 animate-pulse" />
        </div>

        {/* Divider */}
        <div className="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-rust-300/20 to-transparent" />

        {/* Skeleton tanggal */}
        <div className="mt-4 h-3 w-48 rounded-full bg-rust-300/8 animate-pulse" />

        {/* Skeleton nama tamu */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="h-2.5 w-20 rounded-full bg-rust-300/8 animate-pulse" />
          <div className="h-5 w-36 rounded-full bg-rust-300/10 animate-pulse" />
        </div>

        {/* Skeleton tombol */}
        <div className="mt-8 h-11 w-40 rounded-full bg-rust-300/10 animate-pulse" />
      </div>
    </main>
  );
}
