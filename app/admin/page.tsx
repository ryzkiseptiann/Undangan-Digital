"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { getRsvps, deleteRsvp, deleteAllRsvps, type Rsvp, type RsvpStats } from "@/lib/admin-actions";

const DEFAULT_SLUG = "wedding-invitation-digital";

/* ─────────────────────────────────────────────
   Shared UI Primitives
   ───────────────────────────────────────────── */

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Tersalin" : label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer border active:scale-95 ${copied
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
        : "bg-rust-300/10 text-rust-300 border-rust-300/30 hover:bg-rust-300/20"
        }`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="hidden min-[480px]:inline">Tersalin</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="hidden min-[480px]:inline">{label}</span>
        </>
      )}
    </button>
  );
}

function formatWhatsAppMessage(name: string, link: string): string {
  return `Assalamu'alaikum Warahmatullahi Wabarakatuh

Dengan penuh sukacita, kami mengundang

*${name}*

untuk hadir di hari bahagia kami.

*Rini Gustiana Sari & Roni Subagja*
💍 *The Wedding Day*

Undangan lengkap dapat dilihat melalui tautan berikut:

📩 *Buka Undangan*
${link}

Kehadiran dan doa restu Anda merupakan kebahagiaan bagi kami.

Terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh`;
}

/** Encode text for wa.me URL while preserving emoji characters */
function encodeWAMessage(text: string): string {
  // encodeURIComponent then decode emoji back (4-byte Unicode supplementary chars)
  return text.split("").reduce((acc, char) => {
    const code = char.codePointAt(0) ?? 0;
    // Keep emoji (>= U+1F300) and extended chars unencoded — WhatsApp handles them fine
    if (code > 0x7e) {
      return acc + encodeURIComponent(char);
    }
    return acc + encodeURIComponent(char);
  }, "")
    // Restore percent-encoded emoji (F0 xx xx xx sequences) back to raw chars
    .replace(/%F0%9[0-9A-F]%[89AB][0-9A-F]%[89AB][0-9A-F]/gi, (encoded) =>
      decodeURIComponent(encoded)
    )
    // Also restore 3-byte sequences for emoji in BMP supplementary range
    .replace(/%E[0-9A-F]%[89AB][0-9A-F]%[89AB][0-9A-F]/gi, (encoded) =>
      decodeURIComponent(encoded)
    );
}

function WhatsAppButton({ name, link }: { name: string; link: string }) {
  function handleClick() {
    const message = formatWhatsAppMessage(name, link);
    const encoded = encodeWAMessage(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Kirim ke ${name} via WhatsApp`}
      className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer border active:scale-95 bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/25"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.531 5.858L.057 23.429a.75.75 0 0 0 .924.924l5.571-1.474A11.951 11.951 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.656-.514-5.168-1.41l-.368-.215-3.811 1.009 1.009-3.811-.215-.368A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      <span className="hidden min-[480px]:inline">WA</span>
    </button>
  );
}

function buildLink(slug: string, name: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/u/${slug}?to=${encodeURIComponent(name.trim())}`;
}

/* ─────────────────────────────────────────────
   Tab: Link Generator
   ───────────────────────────────────────────── */

function LinkGeneratorTab({ slug }: { slug: string }) {
  const [names, setNames] = useState<string[]>([]);
  const [singleName, setSingleName] = useState("");

  function handleAddSingle() {
    const name = singleName.trim();
    if (!name) return;
    setNames((prev) => [...prev, name]);
    setSingleName("");
  }

  function handleRemove(index: number) {
    setNames((prev) => prev.filter((_, i) => i !== index));
  }

  const allLinks = useCallback(() =>
    names.map((n) => `${n}: ${buildLink(slug, n)}`).join("\n"), [names, slug]);

  return (
    <div className="space-y-4">
      {/* Add single name */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-rust-400 mb-3">
          Tambah Tamu
        </label>
        <div className="space-y-2.5">
          <input
            type="text"
            value={singleName}
            onChange={(e) => setSingleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSingle()}
            placeholder="Masukkan nama tamu"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[16px] text-rust-100 placeholder-rust-300/30 outline-none focus:border-rust-300/50 focus:bg-white/8 transition-all"
          />
          <button
            type="button"
            onClick={handleAddSingle}
            className="w-full rounded-xl bg-rust-300 px-5 py-3 text-[13px] font-bold uppercase tracking-wider text-luxury-dark hover:bg-rust-200 transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            Tambah
          </button>
        </div>
      </div>

      {/* Generated links */}
      {names.length > 0 ? (
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rust-300 text-[10px] font-bold text-luxury-dark">
                  {names.length}
                </span>
                <p className="text-[12px] font-bold uppercase tracking-widest text-rust-300">Link Terbuat</p>
              </div>
              <button
                type="button"
                onClick={() => setNames([])}
                className="text-[12px] text-rust-300/40 hover:text-red-400 transition-colors cursor-pointer py-1 px-2"
              >
                Hapus Semua
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <CopyButton text={allLinks()} label="Copy Semua Link" />
            </div>
          </div>

          {/* Name list */}
          <div className="space-y-2">
            {names.map((name, i) => {
              const link = buildLink(slug, name);
              return (
                <div
                  key={i}
                  className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-3 transition-all"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rust-300/10 text-[14px] font-bold text-rust-300">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-rust-100 truncate">{name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-rust-300/35">{link}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CopyButton text={link} label="Copy Link" />
                    <CopyButton text={formatWhatsAppMessage(name, link)} label="Copy Pesan" />
                    <WhatsAppButton name={name} link={link} />
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="rounded-full p-2.5 text-rust-300/40 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 px-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rust-300/20 bg-rust-300/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rust-300/40">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-[14px] text-rust-300/40">Belum ada tamu. Tambah nama di atas.</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab: Data RSVP
   ───────────────────────────────────────────── */

function RsvpDataTab({ slug }: { slug: string }) {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [stats, setStats] = useState<RsvpStats>({ total: 0, attending: 0, not_attending: 0, totalPax: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "attending" | "not_attending">("all");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function fetchData() {
    setLoading(true);
    const result = await getRsvps(slug);
    setRsvps(result.rsvps);
    setStats(result.stats);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [slug]); // eslint-disable-line

  function handleDelete(id: string) {
    startTransition(async () => { await deleteRsvp(id, slug); await fetchData(); });
  }

  function handleDeleteAll() {
    startTransition(async () => {
      await deleteAllRsvps(slug);
      await fetchData();
      setConfirmDeleteAll(false);
    });
  }

  const filtered = rsvps.filter((r) => filter === "all" || r.attendance_status === filter);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  const statCards = [
    {
      label: "Total RSVP", value: stats.total,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      color: "text-rust-200", bg: "bg-rust-300/10", border: "border-rust-300/20",
    },
    {
      label: "Hadir", value: stats.attending,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>,
      color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25",
    },
    {
      label: "Berhalangan", value: stats.not_attending,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
      color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/25",
    },
    {
      label: "Total Tamu", value: stats.totalPax,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.318A5.278 5.278 0 0 0 8.204 3c-2.88 0-5.204 2.276-5.204 5.082 0 3.864 8.163 10.918 9 11.918.837-1 9-8.054 9-11.918C21 5.276 18.68 3 15.796 3 14.28 3 12.926 3.568 12 4.318z" /></svg>,
      color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/25",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stat Cards — always 2 cols on mobile */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-4 backdrop-blur-sm`}>
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${s.bg} border ${s.border} ${s.color}`}>
              {s.icon}
            </div>
            <p className={`font-serif text-[28px] font-light leading-none ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-rust-300/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Actions */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(["all", "attending", "not_attending"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-full py-2.5 text-[12px] font-bold uppercase tracking-wide transition-all cursor-pointer text-center active:scale-[0.97] ${filter === f
                ? "bg-rust-300 text-luxury-dark"
                : "border border-white/10 text-rust-300/50"
                }`}
            >
              {f === "all" ? "Semua" : f === "attending" ? "Hadir" : "Tidak"}
            </button>
          ))}
        </div>
        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-wide text-rust-300/50 transition-all cursor-pointer disabled:opacity-30 active:scale-95"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}>
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          {rsvps.length > 0 && (
            confirmDeleteAll ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-red-400">Yakin?</span>
                <button type="button" onClick={handleDeleteAll} disabled={isPending} className="rounded-full bg-red-500 px-3 py-1.5 text-[12px] font-bold uppercase text-white cursor-pointer disabled:opacity-50 active:scale-95">Ya</button>
                <button type="button" onClick={() => setConfirmDeleteAll(false)} className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-rust-300/50 cursor-pointer">Batal</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDeleteAll(true)} className="rounded-full border border-red-400/25 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-wide text-red-400/60 hover:text-red-400 transition-all cursor-pointer active:scale-95">
                Hapus Semua
              </button>
            )
          )}
        </div>
      </div>

      {/* RSVP List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 px-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rust-300/20 bg-rust-300/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rust-300/40">
              <path d="M22 11.08V12a10.002 10.002 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <p className="text-[14px] text-rust-300/40">
            {rsvps.length === 0 ? "Belum ada RSVP masuk." : "Tidak ada data untuk filter ini."}
          </p>
        </div>
      ) : (
        <div className={`space-y-2 transition-opacity duration-200 ${isPending ? "opacity-50" : ""}`}>
          {filtered.map((rsvp) => {
            const isAttending = rsvp.attendance_status === "attending";
            return (
              <div
                key={rsvp.id}
                className={`group rounded-xl border p-3.5 transition-all ${isAttending ? "border-emerald-400/15 bg-emerald-400/5" : "border-red-400/15 bg-red-400/5"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${isAttending ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/20 text-red-400"
                    }`}>
                    {rsvp.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-rust-100">{rsvp.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${isAttending
                        ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/25"
                        : "bg-red-400/10 text-red-400 border-red-400/25"
                        }`}>
                        {isAttending ? `Hadir · ${rsvp.pax} tamu` : "Berhalangan"}
                      </span>
                      <span className="text-[10px] text-rust-300/25">{formatDate(rsvp.created_at)}</span>
                    </div>
                    {rsvp.note && (
                      <p className="mt-2 text-[12px] italic text-rust-300/50 leading-relaxed">&ldquo;{rsvp.note}&rdquo;</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(rsvp.id)}
                    disabled={isPending}
                    aria-label={`Hapus RSVP ${rsvp.name}`}
                    className="flex-shrink-0 rounded-full p-2.5 text-rust-300/40 hover:bg-red-400/10 hover:text-red-400 transition-all cursor-pointer disabled:opacity-30 active:scale-90"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Admin Page
   ───────────────────────────────────────────── */

export default function AdminPage() {
  const slug = DEFAULT_SLUG;
  const [activeTab, setActiveTab] = useState<"links" | "rsvp">("links");

  const tabs = [
    {
      id: "links" as const,
      label: "Generator Link",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      id: "rsvp" as const,
      label: "Data RSVP",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 11.08V12a10.002 10.002 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-luxury-dark font-sans text-rust-100">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-rust-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-15%] h-[400px] w-[400px] rounded-full bg-rust-700/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 lg:py-20 lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 xl:gap-16 lg:items-start">

        {/* Sidebar / Header */}
        <div className="lg:sticky lg:top-12">
          {/* Header */}
          <div className="mb-8 lg:mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rust-300/20 bg-rust-300/8 px-3 py-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-rust-300/60">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rust-300/70">Admin Panel</span>
            </div>
            <h1 className="font-serif text-[28px] lg:text-4xl font-light text-rust-100 leading-tight">
              <span className="italic text-rust-300 lg:block lg:mt-1">Undangan Digital</span>
            </h1>
            <p className="mt-2.5 text-[13px] text-rust-300/50 leading-relaxed">
              Kelola tamu undangan dan pantau data RSVP secara real-time.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 lg:mb-0 flex lg:flex-col gap-1.5 rounded-2xl border border-white/8 bg-black/20 p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 lg:flex-none items-center justify-center lg:justify-start gap-2.5 rounded-xl px-3 py-3 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-[0.97] ${activeTab === tab.id
                  ? "bg-rust-300 text-luxury-dark shadow-lg shadow-rust-300/20"
                  : "text-rust-300/40 hover:text-rust-300/70 hover:bg-white/5"
                  }`}
              >
                <div className={activeTab === tab.id ? "opacity-100" : "opacity-60"}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-w-0">
          {activeTab === "links" ? <LinkGeneratorTab slug={slug} /> : <RsvpDataTab slug={slug} />}
        </div>
      </div>
    </main>
  );
}
