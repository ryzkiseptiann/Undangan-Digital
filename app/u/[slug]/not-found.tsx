export default function InvitationNotFound() {
  return (
    <main className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-luxury-dark px-6 overflow-hidden">
      {/* Ambient glow — sama dengan cover section */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,22,17,0.2),rgba(45,22,17,0.95))]" />

      <div className="relative flex flex-col items-center text-center max-w-sm">
        {/* Ornament ring */}
        <svg
          className="mb-8 opacity-30"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle cx="24" cy="24" r="22" stroke="#dfb09e" strokeWidth="0.75" />
          <circle cx="24" cy="24" r="14" stroke="#dfb09e" strokeWidth="0.5" strokeDasharray="3 4" />
          <circle cx="24" cy="24" r="3" fill="#dfb09e" fillOpacity="0.6" />
        </svg>

        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.46em] text-rust-400">
          Undangan Digital
        </p>

        <h1 className="mt-5 font-serif text-3xl font-light italic leading-snug text-rust-100 sm:text-4xl">
          Tautan ini belum tersedia
        </h1>

        <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-rust-300/40 to-transparent" />

        <p className="mt-6 font-sans text-sm font-light leading-relaxed text-rust-200/55">
          Mungkin link yang Anda buka sudah berubah atau belum aktif.
          Silakan cek kembali undangan yang Anda terima.
        </p>
      </div>
    </main>
  );
}
