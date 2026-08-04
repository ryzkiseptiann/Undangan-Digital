import { loginAdmin } from "@/lib/admin-auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-luxury-dark px-4 font-sans text-rust-100">
      <form action={loginAdmin} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rust-300/70">Admin Panel</p>
        <h1 className="mt-2 font-serif text-3xl font-light">Masuk</h1>
        <p className="mt-2 text-sm leading-relaxed text-rust-300/55">Masukkan password untuk mengelola undangan dan RSVP.</p>

        <label className="mt-6 block text-[11px] font-bold uppercase tracking-widest text-rust-400" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-rust-100 outline-none transition-colors focus:border-rust-300/50"
        />
        {error && <p className="mt-3 text-sm text-red-400">Password tidak sesuai.</p>}
        <button type="submit" className="mt-6 w-full rounded-xl bg-rust-300 px-5 py-3 text-sm font-bold uppercase tracking-wider text-luxury-dark transition-colors hover:bg-rust-200">
          Masuk
        </button>
      </form>
    </main>
  );
}
