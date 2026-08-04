"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { submitRsvp, submitWish, type FormResult } from "@/lib/invitation-actions";
import type {
  EventSession,
  GalleryImage,
  GiftAccount,
  InvitationDetail,
  Wish,
} from "@/types/invitation";

type InvitationExperienceProps = {
  detail: InvitationDetail;
  guestName: string;
};

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

const emptyFormState: FormResult = {
  status: "idle",
  message: "",
};

const DEFAULT_HERO_IMAGE = "/images/demo/hero.jpeg";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

function getCountdownParts(target: string): CountdownParts {
  const distance = new Date(target).getTime() - Date.now();

  if (distance <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      completed: true,
    };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    completed: false,
  };
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatTime(value: string) {
  return `${timeFormatter.format(new Date(value))} WIB`;
}

function firstNames(displayNames: string) {
  const [first = "", second = ""] = displayNames.split("&").map((name) => name.trim());
  return { first, second };
}

export function InvitationExperience({
  detail,
  guestName,
}: InvitationExperienceProps) {
  const { invitation, sessions, galleries, giftAccounts, wishes } = detail;
  const { first, second } = firstNames(invitation.display_names);
  const [isOpened, setIsOpened] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    setIsOpened(true);
    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-luxury-cream text-luxury-dark font-sans selection:bg-rust-200 selection:text-luxury-dark font-sans">
      <CoverSection
        displayNames={invitation.display_names}
        guestName={guestName}
        eventDate={invitation.main_event_at}
        heroImageUrl={invitation.hero_image_url}
        isOpened={isOpened}
        onOpen={handleOpen}
      />

      <div ref={contentRef}>
        <HeroSection
          firstName={first || invitation.bride_name || "Aruna"}
          secondName={second || invitation.groom_name || "Sagara"}
          openingText={invitation.opening_text}
          quote={invitation.quote}
          eventDate={invitation.main_event_at}
          heroImageUrl={invitation.hero_image_url}
        />

        <CountdownSection targetDate={invitation.main_event_at} />

        <EventDetails sessions={sessions} />

        <GallerySection galleries={galleries} />

        <GiftSection giftAccounts={giftAccounts} />

        <RsvpSection
          invitationId={invitation.id}
          slug={invitation.slug}
          defaultName={guestName === "Tamu Undangan" ? "" : guestName}
        />

        <WishesSection
          invitationId={invitation.id}
          slug={invitation.slug}
          wishes={wishes}
          defaultName={guestName === "Tamu Undangan" ? "" : guestName}
        />

        <ClosingSection displayNames={invitation.display_names} />
      </div>

      <MusicControl musicUrl={invitation.music_url} shouldStart={isOpened} />
    </main>
  );
}

function CoverSection({
  displayNames,
  guestName,
  eventDate,
  heroImageUrl,
  isOpened,
  onOpen,
}: {
  displayNames: string;
  guestName: string;
  eventDate: string;
  heroImageUrl: string | null;
  isOpened: boolean;
  onOpen: () => void;
}) {
  return (
    <section
      className={`fixed inset-0 z-40 grid min-h-screen place-items-center overflow-hidden bg-luxury-dark px-6 text-rust-100 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${isOpened ? "pointer-events-none translate-y-[-100%] opacity-0" : "opacity-100"
        }`}
    >
      <div
        className="hero-photo-cover absolute inset-0 opacity-30"
        style={{ backgroundImage: `url(${heroImageUrl || DEFAULT_HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,22,17,0.2),rgba(45,22,17,0.95))]" />
      <div className="relative w-full max-w-2xl text-center">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.52em] text-rust-300">
          The Wedding Invitation
        </p>
        <h1 className="mt-8 font-serif text-5xl font-light italic leading-tight sm:text-7.5xl text-rust-100">
          {displayNames}
        </h1>
        <p className="mt-8 font-sans text-xs uppercase tracking-[0.34em] text-rust-200/70">
          {formatDate(eventDate)}
        </p>
        <div className="mx-auto mt-10 h-px w-32 bg-gradient-to-r from-transparent via-rust-300/40 to-transparent" />
        <p className="mt-10 font-sans text-[10px] uppercase tracking-[0.3em] text-rust-400">
          Kepada Yth.
        </p>
        <p className="mt-3 font-serif text-2xl font-light italic text-rust-100">{guestName}</p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-12 min-h-12 border border-rust-300/40 bg-rust-300 text-luxury-dark px-9 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] transition duration-500 hover:bg-transparent hover:text-rust-200 hover:border-rust-300 cursor-pointer"
        >
          Buka Undangan
        </button>
      </div>
    </section>
  );
}

function HeroSection({
  firstName,
  secondName,
  openingText,
  quote,
  eventDate,
  heroImageUrl,
}: {
  firstName: string;
  secondName: string;
  openingText: string | null;
  quote: string | null;
  eventDate: string;
  heroImageUrl: string | null;
}) {
  return (
    <section className="relative min-h-screen bg-luxury-dark text-rust-100">
      <div
        className="hero-photo-cover absolute inset-0 opacity-40"
        style={{ backgroundImage: `url(${heroImageUrl || DEFAULT_HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark via-luxury-dark/80 to-luxury-dark/90" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:px-16">
        <div className="order-2 lg:order-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.45em] text-rust-300">
            Save The Date
          </p>
          <h2 className="mt-8 font-serif text-7xl font-light leading-none sm:text-9xl tracking-tight">
            {firstName}
            <span className="block text-rust-300 font-serif font-extralight italic my-3 text-5xl sm:text-7xl">&amp;</span>
            {secondName}
          </h2>
          <p className="mt-8 max-w-xl font-sans text-sm font-light leading-8 text-rust-200/80 tracking-wide">
            {openingText ||
              "Dengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu."}
          </p>
        </div>
        <div className="order-1 border border-rust-300/10 p-2 lg:order-2">
          <div className="glass-premium-dark p-8">
            <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-rust-300">
              Wedding Day
            </p>
            <p className="mt-6 font-serif text-3xl font-light text-rust-100">{formatDate(eventDate)}</p>
            <p className="mt-3 font-sans text-xs tracking-widest text-rust-200/80">{formatTime(eventDate)}</p>
            {quote ? (
              <blockquote className="mt-8 border-l-2 border-rust-300/40 pl-6 font-serif text-base italic leading-7 text-rust-100/90 font-light">
                {quote}
              </blockquote>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CountdownSection({ targetDate }: { targetDate: string }) {
  const [countdown, setCountdown] = useState(() => getCountdownParts(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts(targetDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const items = [
    ["Hari", countdown.days],
    ["Jam", countdown.hours],
    ["Menit", countdown.minutes],
    ["Detik", countdown.seconds],
  ] as const;

  return (
    <section className="bg-luxury-cream px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.45em] text-rust-700">
          Menuju Hari Bahagia
        </p>
        {countdown.completed ? (
          <h2 className="mt-6 font-serif text-3xl font-light text-luxury-dark">
            Acara telah berlangsung
          </h2>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {items.map(([label, value]) => (
              <div key={label} className="glass-premium-light p-6">
                <p className="font-serif text-5xl font-light text-luxury-dark">
                  {String(value).padStart(2, "0")}
                </p>
                <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.3em] text-rust-600 font-semibold">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventDetails({ sessions }: { sessions: EventSession[] }) {
  return (
    <section className="bg-luxury-cream px-6 py-20 sm:px-10 border-t border-rust-300/10">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Rangkaian Acara" title="Dengan hormat kami menantikan kehadiran Anda" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sessions.map((session) => (
            <article key={session.id} className="glass-premium-light p-8">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-rust-600">
                {session.name}
              </p>
              <h3 className="mt-6 font-serif text-3xl font-light text-luxury-dark">
                {formatDate(session.starts_at)}
              </h3>
              <p className="mt-2 font-sans text-xs tracking-wider text-rust-700">{formatTime(session.starts_at)}</p>
              {session.venue_name ? (
                <p className="mt-8 font-serif text-xl font-medium text-luxury-dark">
                  {session.venue_name}
                </p>
              ) : null}
              {session.address ? (
                <p className="mt-2 font-sans text-sm font-light leading-relaxed text-luxury-dark/70">{session.address}</p>
              ) : null}
              {session.maps_url ? (
                <a
                  href={session.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex min-h-11 items-center justify-center border border-rust-500/50 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-rust-800 transition duration-500 hover:bg-rust-500 hover:text-luxury-cream hover:border-rust-500"
                >
                  Buka Maps
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ galleries }: { galleries: GalleryImage[] }) {
  return (
    <section className="bg-luxury-dark px-6 py-20 text-rust-100 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Gallery"
          title="Beberapa potongan cerita yang ingin kami bagikan"
          inverted
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {galleries.map((image, index) => (
            <figure
              key={image.id}
              className={`min-h-[380px] border border-rust-300/10 bg-cover bg-center ${index === 0 ? "md:min-h-[520px]" : ""
                }`}
              style={{ backgroundImage: `url(${image.image_url})` }}
            >
              <figcaption className="sr-only">
                {image.alt_text || "Wedding gallery image"}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function GiftSection({ giftAccounts }: { giftAccounts: GiftAccount[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyAccount(gift: GiftAccount) {
    await navigator.clipboard.writeText(gift.account_number);
    setCopiedId(gift.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <section className="bg-luxury-cream px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Wedding Gift" title="Doa restu Anda adalah hadiah terindah" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {giftAccounts.length > 0 ? (
            giftAccounts.map((gift) => (
              <article key={gift.id} className="glass-premium-light p-8">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-rust-600">
                  {gift.provider}
                </p>
                <p className="mt-6 font-mono text-2xl font-light tracking-wider text-luxury-dark">
                  {gift.account_number}
                </p>
                <p className="mt-2 font-sans text-sm font-light text-luxury-dark/70">a.n. {gift.account_name}</p>
                <button
                  type="button"
                  onClick={() => copyAccount(gift)}
                  className="mt-6 min-h-11 border border-rust-500/50 bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-rust-800 transition duration-500 hover:bg-rust-500 hover:text-luxury-cream hover:border-rust-500 cursor-pointer"
                >
                  {copiedId === gift.id ? "Tersalin" : "Salin Nomor"}
                </button>
              </article>
            ))
          ) : (
            <p className="font-sans text-sm text-luxury-dark/50">Informasi gift belum tersedia.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function RsvpSection({
  invitationId,
  slug,
  defaultName,
}: {
  invitationId: string;
  slug: string;
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState(submitRsvp, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="bg-luxury-cream px-6 py-20 sm:px-10 border-t border-rust-300/10">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="RSVP"
          title="Konfirmasi kehadiran Anda"
          description="Bantu kami menyiapkan sambutan terbaik dengan mengisi konfirmasi berikut."
        />
        <form ref={formRef} action={formAction} className="glass-premium-light p-8">
          <input type="hidden" name="invitationId" value={invitationId} />
          <input type="hidden" name="slug" value={slug} />
          <Field label="Nama" name="name" defaultValue={defaultName} required />
          <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-800">
            Kehadiran
            <select
              name="attendanceStatus"
              required
              defaultValue="attending"
              className="mt-2 h-12 w-full border-b border-rust-300/40 bg-transparent px-1 font-sans text-sm text-luxury-dark outline-none transition-all duration-300 focus:border-rust-600 focus:ring-0"
            >
              <option value="attending">Hadir</option>
              <option value="not_attending">Tidak hadir</option>
            </select>
          </label>
          <Field label="Jumlah tamu" name="pax" type="number" min="1" max="10" defaultValue="1" required />
          <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-800">
            Catatan
            <textarea
              name="note"
              rows={4}
              maxLength={300}
              className="mt-2 w-full resize-none border-b border-rust-300/40 bg-transparent px-1 py-2 font-sans text-sm text-luxury-dark outline-none transition-all duration-300 focus:border-rust-600 focus:ring-0"
              placeholder="Opsional"
            />
          </label>
          <FormMessage state={state} />
          <button
            type="submit"
            disabled={pending}
            className="mt-8 min-h-12 w-full bg-luxury-dark px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-rust-100 transition duration-500 hover:bg-rust-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Mengirim..." : "Kirim RSVP"}
          </button>
        </form>
      </div>
    </section>
  );
}

function WishesSection({
  invitationId,
  slug,
  wishes,
  defaultName,
}: {
  invitationId: string;
  slug: string;
  wishes: Wish[];
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState(submitWish, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="bg-luxury-dark px-6 py-20 text-rust-100 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <SectionHeading
            eyebrow="Ucapan & Doa"
            title="Tinggalkan pesan terbaik Anda"
            description="Setiap doa akan menjadi bagian hangat dari hari bahagia kami."
            inverted
          />
          <form ref={formRef} action={formAction} className="glass-premium-dark mt-8 p-8">
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />
            <Field label="Nama" name="name" defaultValue={defaultName} required />
            <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-300">
              Ucapan
              <textarea
                name="message"
                rows={5}
                minLength={5}
                maxLength={500}
                required
                className="mt-2 w-full resize-none border-b border-rust-300/40 bg-transparent px-1 py-2 font-sans text-sm text-current outline-none transition-all duration-300 focus:border-rust-400 focus:ring-0"
                placeholder="Tulis ucapan dan doa..."
              />
            </label>
            <FormMessage state={state} />
            <button
              type="submit"
              disabled={pending}
              className="mt-8 min-h-12 w-full bg-rust-300 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#120e0c] transition duration-500 hover:bg-rust-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>
        </div>
        <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
          {wishes.length > 0 ? (
            wishes.map((wish) => (
              <article key={wish.id} className="glass-premium-dark p-6">
                <p className="font-serif text-lg font-semibold text-rust-300">{wish.name}</p>
                <p className="mt-3 font-sans text-sm font-light leading-relaxed text-rust-100/80">{wish.message}</p>
              </article>
            ))
          ) : (
            <p className="border border-rust-300/10 p-6 text-rust-200/50 font-sans text-sm text-center">
              Jadilah yang pertama mengirim ucapan.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ClosingSection({ displayNames }: { displayNames: string }) {
  return (
    <section className="bg-luxury-cream px-6 py-24 text-center sm:px-10 border-t border-rust-300/10">
      <p className="font-sans text-[11px] uppercase tracking-[0.45em] text-rust-700">
        Terima Kasih
      </p>
      <h2 className="mt-6 font-serif text-5xl font-light text-luxury-dark sm:text-6xl">
        {displayNames}
      </h2>
      <p className="mx-auto mt-6 max-w-2xl font-sans text-sm font-light leading-8 text-luxury-dark/70 tracking-wide">
        Merupakan kehormatan dan kebahagiaan bagi kami apabila Anda berkenan
        hadir dan memberikan doa restu.
      </p>
    </section>
  );
}

function MusicControl({
  musicUrl,
  shouldStart,
}: {
  musicUrl: string | null;
  shouldStart: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  // If a music URL is provided, try to autoplay when invitation opens.
  useEffect(() => {
    if (!shouldStart || !musicUrl || isUnavailable) return;
    audioRef.current
      ?.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsUnavailable(true));
  }, [shouldStart, musicUrl, isUnavailable]);

  // Always show the control button. If no valid URL, the button will simply toggle nothing.
  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      {musicUrl && (
        <audio ref={audioRef} src={musicUrl} loop preload="none" />
      )}
      <button
        type="button"
        aria-label={isPlaying ? "Pause music" : "Play music"}
        onClick={toggleAudio}
        className="fixed bottom-4 left-4 z-[999] flex w-12 h-12 items-center justify-center rounded-full bg-rust-200/80 text-rust-900 hover:bg-rust-300/90 focus:outline-none shadow-lg"
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  inverted,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  inverted?: boolean;
}) {
  return (
    <div className="mb-10">
      <p className={`font-sans text-[11px] font-semibold uppercase tracking-[0.4em] ${inverted ? "text-rust-300" : "text-rust-600"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 max-w-3xl font-serif text-4xl font-light leading-tight sm:text-5xl ${inverted ? "text-rust-100" : "text-luxury-dark"}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-2xl font-sans text-sm font-light leading-relaxed tracking-wide ${inverted ? "text-rust-200/80" : "text-luxury-dark/70"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  const inputId = useMemo(() => `${name}-${label.toLowerCase().replace(/\s+/g, "-")}`, [label, name]);

  return (
    <label htmlFor={inputId} className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-850 first:mt-0">
      {label}
      <input
        id={inputId}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        max={max}
        className="mt-2 h-12 w-full border-b border-rust-300/40 bg-transparent px-1 font-sans text-sm text-current outline-none transition-all duration-300 focus:border-rust-400 focus:ring-0"
      />
    </label>
  );
}

function FormMessage({ state }: { state: FormResult }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`mt-6 border px-4 py-3 text-xs font-sans tracking-wide ${state.status === "success"
          ? "border-[#93a36b]/40 bg-[#f0f5e6]/20 text-[#677747]"
          : "border-[#b97878]/40 bg-[#fbeded]/20 text-[#a34b4b]"
        }`}
    >
      {state.message}
    </p>
  );
}
