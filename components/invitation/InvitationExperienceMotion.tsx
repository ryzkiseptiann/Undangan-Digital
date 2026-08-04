"use client";

import React, {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import Image from "next/image";
import { submitRsvp, submitWish, type FormResult } from "@/lib/invitation-actions";
import type {
  EventSession,
  ExistingRsvp,
  GalleryImage,
  GiftAccount,
  InvitationDetail,
  Wish,
} from "@/types/invitation";

type InvitationExperienceProps = {
  detail: InvitationDetail;
  guestName: string;
  existingRsvp: ExistingRsvp | null;
};

const emptyFormState: FormResult = {
  status: "idle",
  message: "",
};

const DEFAULT_HERO_IMAGE = "/images/demo/hero.jpeg";

const BUTTON_PRIMARY_CLASS =
  "premium-focus shimmer-effect inline-flex min-h-12 items-center justify-center rounded-full bg-rust-300 px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-luxury-dark transition-all duration-500 hover:-translate-y-0.5 hover:bg-rust-100 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0 cursor-pointer sm:tracking-[0.24em]";

const BUTTON_DARK_CLASS =
  "premium-focus shimmer-effect inline-flex min-h-12 items-center justify-center rounded-full bg-luxury-dark px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-rust-100 transition-all duration-500 hover:-translate-y-0.5 hover:bg-rust-900 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0 cursor-pointer sm:tracking-[0.24em]";

const BUTTON_OUTLINE_CLASS =
  "premium-focus inline-flex min-h-11 items-center justify-center rounded-full border border-rust-500/45 bg-transparent px-6 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-rust-800 transition-all duration-500 hover:-translate-y-0.5 hover:border-rust-500 hover:bg-rust-500 hover:text-luxury-cream active:translate-y-0 cursor-pointer";

const FLOATING_BUTTON_CLASS =
  "premium-focus min-h-11 rounded-full border border-rust-300/40 bg-luxury-dark/95 px-4 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-rust-200 shadow-[0_14px_30px_rgba(0,0,0,0.22)] backdrop-blur transition-all duration-500 hover:-translate-y-0.5 hover:bg-rust-900 active:translate-y-0 cursor-pointer sm:px-5 sm:tracking-[0.2em]";

const FORM_FIELD_LIGHT_CLASS =
  "mt-2 min-h-12 w-full rounded-sm border-b border-rust-300/40 bg-transparent px-1 font-sans text-base text-luxury-dark outline-none transition-all duration-300 focus:border-rust-600 focus:border-b-2 focus-visible:ring-2 focus-visible:ring-rust-400/45 focus-visible:ring-offset-4 focus-visible:ring-offset-luxury-cream";

const FORM_FIELD_DARK_CLASS =
  "mt-2 min-h-12 w-full rounded-sm border-b border-rust-300/40 bg-transparent px-1 font-sans text-base text-current outline-none transition-all duration-300 focus:border-rust-300 focus:border-b-2 focus-visible:ring-2 focus-visible:ring-rust-300/45 focus-visible:ring-offset-4 focus-visible:ring-offset-luxury-dark";

const CARD_LIFT_LIGHT_CLASS =
  "transition-all duration-500 hover:-translate-y-1 hover:border-rust-500/35 hover:shadow-[0_18px_36px_rgba(45,22,17,0.08)]";

const CARD_LIFT_DARK_CLASS =
  "transition-all duration-500 hover:-translate-y-1 hover:border-rust-300/30 hover:shadow-[0_18px_36px_rgba(0,0,0,0.32)]";

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

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatTime(value: string) {
  return `${timeFormatter.format(new Date(value))} WIB`;
}

function splitNames(displayNames: string) {
  const [first = "", second = ""] = displayNames
    .split(/&|\u2661/)
    .map((part) => part.trim());
  return { first, second };
}

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function getCountdownParts(target: string) {
  const distance = new Date(target).getTime() - Date.now();
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    completed: false,
  };
}

// Minimalist Botanical Leaf SVG Ornament
function LeafOrnament({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="160"
      height="160"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 110C40 80 50 40 100 10C80 40 70 70 10 110Z"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <path
        d="M10 110C35 75 60 50 100 10M100 10C85 30 75 60 60 85M60 85C45 65 40 45 35 30M100 10C75 12 55 25 45 40"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
    </svg>
  );
}

// Spinning Monogram Ring with Initials
function CircularMonogram({ displayNames, className }: { displayNames: string; className?: string }) {
  const initials = useMemo(() => {
    return displayNames
      .split(/&|\u2661/)
      .map((n) => n.trim()[0])
      .join(" & ");
  }, [displayNames]);

  return (
    <div className={`relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28 ${className}`}>
      <svg
        className="absolute h-full w-full animate-[spin_45s_linear_infinite] pointer-events-none"
        width="112"
        height="112"
        viewBox="0 0 100 100"
      >
        <path
          id="textPath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text className="fill-rust-300/40 text-[5.8px] uppercase tracking-[0.27em] font-sans font-light">
          <textPath href="#textPath">
            PERNIKAHAN - {displayNames} - DENGAN PENUH CINTA -
          </textPath>
        </text>
      </svg>
      <div className="font-serif text-2xl font-light italic text-rust-200/90 tracking-wider sm:text-3xl">
        {initials}
      </div>
    </div>
  );
}

export function InvitationExperience({
  detail,
  guestName,
  existingRsvp,
}: InvitationExperienceProps) {
  const { invitation, sessions, galleries, giftAccounts, wishes } = detail;
  const { first, second } = splitNames(invitation.display_names);
  const [isOpened, setIsOpened] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useRevealObserver(true);
  useScrollParallax(contentRef);

  useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpened]);

  function handleOpen() {
    setIsOpened(true);
    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
    }, 80);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-luxury-cream text-luxury-dark font-sans selection:bg-rust-200 selection:text-luxury-dark relative">
      <CoverSection
        displayNames={invitation.display_names}
        guestName={guestName}
        eventDate={invitation.main_event_at}
        heroImageUrl={invitation.hero_image_url}
        isOpened={isOpened}
        onOpen={handleOpen}
      />

      <div ref={contentRef} className="relative z-10">
        {isOpened ? (
          <>
            <FloatingNav />
            <MobileNav />
          </>
        ) : null}

        <RevealSection depth="lg">
          <QuranSection />
        </RevealSection>

        <RevealSection depth="lg">
          <HeroSection
            firstName={first || invitation.bride_name || "Aruna"}
            secondName={second || invitation.groom_name || "Sagara"}
            heroImageUrl={invitation.hero_image_url}
          />
        </RevealSection>

        <RevealSection depth="md">
          <FamilySection
            brideName={first || invitation.bride_name || ""}
            groomName={second || invitation.groom_name || ""}
            bridePhotoUrl={invitation.bride_photo_url}
            groomPhotoUrl={invitation.groom_photo_url}
          />
        </RevealSection>

        <RevealSection id="events" depth="sm">
          <CountdownSection targetDate={invitation.main_event_at} />
        </RevealSection>

        <RevealSection depth="sm">
          <EventDetails sessions={sessions} />
        </RevealSection>

        <RevealSection id="gallery" depth="lg">
          <GallerySection galleries={galleries} />
        </RevealSection>

        <RevealSection id="gift" depth="md">
          <GiftSection giftAccounts={giftAccounts} />
        </RevealSection>

        <RevealSection id="rsvp" depth="md">
          <RsvpSection
            invitationId={invitation.id}
            slug={invitation.slug}
            defaultName={guestName === "Tamu Undangan" ? "" : guestName}
            existingRsvp={existingRsvp}
          />
        </RevealSection>

        <RevealSection id="wishes" depth="md">
          <WishesSection
            invitationId={invitation.id}
            slug={invitation.slug}
            wishes={wishes}
            defaultName={guestName === "Tamu Undangan" ? "" : guestName}
          />
        </RevealSection>

        <RevealSection depth="sm">
          <ClosingSection displayNames={invitation.display_names} />
        </RevealSection>
      </div>

      <MusicControl musicUrl={invitation.music_url} shouldStart={isOpened} />
      <ScrollTopButton />
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
  const coverDisplayNames = displayNames.replace(/\s*\u2661\s*/g, " & ");
  const { first: coverFirstName, second: coverSecondName } = splitNames(coverDisplayNames);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [effects, setEffects] = useState<{ id: number; x: number; y: number; type: "ripple" | "sparkle"; angle?: number }[]>([]);

  function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const now = Date.now();

      // 1 ripple + 6 sparkle di posisi acak sekitar tombol
      const newEffects = [
        { id: now, x: cx, y: cy, type: "ripple" as const },
        ...Array.from({ length: 6 }, (_, i) => ({
          id: now + i + 1,
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 60,
          type: "sparkle" as const,
          angle: Math.random() * 360,
        })),
      ];
      setEffects(newEffects);
      window.setTimeout(() => setEffects([]), 1000);
    }
    onOpen();
  }

  return (
    <section
      className={`fixed inset-0 z-50 flex h-[100svh] min-h-[100svh] items-center justify-center overflow-hidden bg-luxury-dark px-5 py-5 text-rust-100 transition-all duration-1000 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] sm:px-8 sm:py-7 ${isOpened ? "pointer-events-none translate-y-[-100%] opacity-0" : "opacity-100"
        }`}
    >
      <div
        className="parallax-layer absolute inset-0 scale-105 opacity-35"
      >
        <Image
          src={heroImageUrl || DEFAULT_HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_65%]"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,22,17,0.3),rgba(45,22,17,0.95))]" />

      {/* Swaying leaf ornaments on corners */}
      <LeafOrnament className="absolute top-6 left-6 text-rust-300 pointer-events-none animate-float-slow opacity-20" />
      <LeafOrnament className="absolute bottom-6 right-6 text-rust-300 pointer-events-none animate-float-slow-reverse rotate-180 opacity-20" />

      <div className="parallax-layer absolute left-1/2 top-8 h-16 w-px bg-gradient-to-b from-rust-500/0 via-rust-300/35 to-rust-500/0 sm:top-10 sm:h-20" />

      <div className="relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-5xl animate-[fadeUp_1200ms_ease-out] flex-col items-center justify-center text-center">
        <CircularMonogram displayNames={coverDisplayNames} className="mb-3 scale-90 sm:mb-4 sm:scale-95" />

        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-rust-300 sm:text-xs sm:tracking-[0.42em]">
          Undangan Pernikahan
        </p>
        <h1 className="mt-3 max-w-4xl break-words font-serif text-[clamp(2.55rem,5.2vw,5.6rem)] font-light italic leading-[1.02] text-rust-100 [overflow-wrap:anywhere] sm:mt-4">
          {coverSecondName ? (
            <>
              <span className="block">{coverFirstName}</span>
              <span className="my-0.5 block text-[0.52em] leading-none text-rust-300 sm:my-1">&amp;</span>
              <span className="block">{coverSecondName}</span>
            </>
          ) : (
            coverDisplayNames
          )}
        </h1>
        <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.22em] text-rust-200/70 sm:text-xs sm:tracking-[0.28em]">
          {formatDate(eventDate)}
        </p>
        <div className="mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rust-300/30 to-transparent sm:w-28" />
        <p className="mt-5 font-sans text-[11px] uppercase tracking-[0.3em] text-rust-400">
          Kepada Yth.
        </p>
        <p className="mt-2 max-w-full break-words font-serif text-2xl font-light italic text-rust-100 [overflow-wrap:anywhere]">{guestName}</p>

        <button
          ref={btnRef}
          type="button"
          onClick={handleOpen}
          className={`${BUTTON_PRIMARY_CLASS} gold-glow-hover shimmer-effect mt-7 border border-rust-300/30 px-9 relative overflow-hidden sm:mt-8 sm:px-10`}
        >
          Buka Undangan
          {/* Ripple & sparkle effects */}
          {effects.map((fx) =>
            fx.type === "ripple" ? (
              <span
                key={fx.id}
                className="cover-ripple"
                style={{ width: 160, height: 160, left: fx.x - 80, top: fx.y - 80 }}
              />
            ) : (
              <span
                key={fx.id}
                className="cover-sparkle"
                style={{ left: fx.x - 3, top: fx.y - 3, animationDelay: `${(fx.angle ?? 0) / 2.4}ms` }}
              />
            )
          )}
        </button>

        <p className="mt-4 max-w-xs text-[10px] uppercase leading-5 tracking-[0.2em] text-rust-200/45 sm:max-w-none sm:text-[11px] sm:tracking-[0.28em]">
          Silakan buka untuk melihat detail acara
        </p>
      </div>
    </section>
  );
}

function QuranSection() {
  return (
    <section id="quran" className="bg-luxury-cream px-6 py-20 sm:px-10 relative overflow-hidden border-t border-rust-300/10">
      <LeafOrnament className="absolute left-[-30px] top-[-20px] text-rust-500 pointer-events-none animate-float-slow opacity-10 rotate-12" />
      <LeafOrnament className="absolute right-[-30px] bottom-[-20px] text-rust-500 pointer-events-none animate-float-slow-reverse opacity-10 -rotate-12" />

      <div className="relative mx-auto max-w-3xl flex flex-col items-center text-center z-10">
        {/* Surah label */}
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.4em] text-rust-600">
          Q.S. Ar-Rum Ayat 21
        </p>

        {/* Ornamen garis atas */}
        <div className="mt-5 flex items-center gap-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-l from-rust-300/50 to-transparent" />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-rust-400/70 flex-shrink-0">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-r from-rust-300/50 to-transparent" />
        </div>

        {/* Ayat arab — di dalam kotak dark supaya teks arab menonjol */}
        <div className="mt-8 w-full rounded-2xl bg-luxury-dark px-4 sm:px-8 py-8 sm:py-10 border border-rust-300/10">
          <p
            className="font-serif text-2xl sm:text-3xl leading-[2.2] text-rust-100/90 tracking-wide"
            dir="rtl"
            lang="ar"
          >
            وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةًۗ اِنَّ فِيْ ذٰلِكَ لَاٰيٰتٍ لِّقَوْمٍ يَّتَفَكَّرُوْنَ
          </p>
        </div>

        {/* Transliterasi */}
        <p className="mt-7 font-sans text-[13px] italic leading-7 text-luxury-dark/55 max-w-2xl">
          Wa min āyātihī an khalaqa lakum min anfusikum azwājal litaskunū ilaihā wa ja'ala bainakum mawaddataw wa raḥmah, inna fī żālika la'āyātili liqaumiy yatafakkarūn.
        </p>

        {/* Divider */}
        <div className="mt-7 h-px w-16 bg-gradient-to-r from-transparent via-rust-300/50 to-transparent" />

        {/* Terjemahan */}
        <blockquote className="mt-6 font-serif text-base sm:text-lg font-light italic leading-8 text-luxury-dark/70 max-w-2xl">
          "Di antara tanda-tanda kebesaran-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari jenis dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda kebesaran Allah bagi kaum yang berpikir."
        </blockquote>

        {/* Ornamen garis bawah */}
        <div className="mt-8 flex items-center gap-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-l from-rust-300/50 to-transparent" />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-rust-400/70 flex-shrink-0">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-r from-rust-300/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function FamilySection({
  brideName,
  groomName,
  bridePhotoUrl,
  groomPhotoUrl,
}: {
  brideName: string;
  groomName: string;
  bridePhotoUrl: string | null;
  groomPhotoUrl: string | null;
}) {
  const DEFAULT_BRIDE_PHOTO = "/images/demo/Wanita.jpeg";
  const DEFAULT_GROOM_PHOTO = "/images/demo/Pria.jpeg";

  return (
    <section id="family" className="bg-luxury-cream px-6 py-20 sm:px-10 border-t border-rust-300/10 relative overflow-hidden">
      <LeafOrnament className="absolute right-[-30px] top-0 text-rust-500 pointer-events-none animate-float-slow-reverse opacity-10 -rotate-12" />

      <div className="relative mx-auto max-w-4xl z-10">
        <SectionHeading
          eyebrow="Mempelai"
          title="Bismillahirrahmanirrahim"
          description="Dengan mengucap syukur kehadirat Allah SWT dan memohon ridho-Nya, kami mengumumkan pernikahan putra-putri kami."
          compact
        />

        <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-6">
          {/* Mempelai Wanita */}
          <article data-stagger className={`relative rounded-2xl glass-premium-light flex flex-col items-center text-center overflow-hidden ${CARD_LIFT_LIGHT_CLASS}`}>
            {/* Accent strip top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-rust-400/60 to-rust-200/30 z-10" />

            {/* Foto mempelai */}
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-2xl bg-rust-900/10">
              <Image
                src={bridePhotoUrl || DEFAULT_BRIDE_PHOTO}
                alt="Foto mempelai wanita"
                fill
                priority
                sizes="(max-width: 640px) 50vw, 400px"
                className="object-cover object-top"
              />
            </div>

            <div className="px-3 sm:px-6 pt-4 pb-6 sm:pt-6 sm:pb-10 w-full">
              <p className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.38em] text-rust-500">
                Mempelai Wanita
              </p>

              <h3 className="mt-2 sm:mt-3 font-serif text-base sm:text-2xl lg:text-3xl font-light text-luxury-dark leading-tight">
                {brideName}
              </h3>

              <div className="mt-3 sm:mt-5">
                <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-rust-500/70 mb-1 sm:mb-2">
                  Putri dari
                </p>
                <p className="font-sans text-[11px] sm:text-sm font-medium leading-relaxed text-luxury-dark">
                  Bapak Rukmana (Ache)
                </p>
                <p className="font-sans text-[11px] sm:text-sm font-medium leading-relaxed text-luxury-dark">
                  Ibu Siti Maryam
                </p>
              </div>
            </div>
          </article>

          {/* Mempelai Pria */}
          <article data-stagger className={`relative rounded-2xl glass-premium-light flex flex-col items-center text-center overflow-hidden ${CARD_LIFT_LIGHT_CLASS}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-rust-400/60 to-rust-200/30 z-10" />

            {/* Foto mempelai */}
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-2xl bg-rust-900/10">
              <Image
                src={groomPhotoUrl || DEFAULT_GROOM_PHOTO}
                alt="Foto mempelai pria"
                fill
                priority
                sizes="(max-width: 640px) 50vw, 400px"
                className="object-cover object-top"
              />
            </div>

            <div className="px-3 sm:px-6 pt-4 pb-6 sm:pt-6 sm:pb-10 w-full">
              <p className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.38em] text-rust-500">
                Mempelai Pria
              </p>

              <h3 className="mt-2 sm:mt-3 font-serif text-base sm:text-2xl lg:text-3xl font-light text-luxury-dark leading-tight">
                {groomName}
              </h3>

              <div className="mt-3 sm:mt-5">
                <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-rust-500/70 mb-1 sm:mb-2">
                  Putra dari
                </p>
                <p className="font-sans text-[11px] sm:text-sm font-medium leading-relaxed text-luxury-dark">
                  Bapak Syamsudin
                </p>
                <p className="font-sans text-[11px] sm:text-sm font-medium leading-relaxed text-luxury-dark">
                  Ibu Euis Juati
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Ucapan doa */}
        <div className="mt-10 rounded-2xl glass-premium-light px-8 py-7 text-center">
          <p className="font-serif text-base sm:text-lg font-light italic leading-8 text-luxury-dark/70">
            "Ya Allah, satukanlah hati keduanya sebagaimana Engkau telah menyatukan keduanya dalam ikatan yang suci. Berkahilah pernikahan mereka dan jadikanlah rumah tangga mereka penuh dengan sakinah, mawaddah, dan rahmah."
          </p>
          <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.3em] text-rust-500/60">
            Aamiin Ya Rabbal 'Aalamiin
          </p>
        </div>
      </div>
    </section>
  );
}

function HeroSection({
  firstName,
  secondName,
  heroImageUrl,
}: {
  firstName: string;
  secondName: string;
  heroImageUrl: string | null;
}) {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-luxury-dark text-rust-100 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,176,158,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,247,245,0.03),transparent_35%)]" />
      {/* Noise Texture */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Ghost initials — desktop only to prevent mobile clip */}
      <div className="absolute left-[-100px] top-[15%] hidden text-[15rem] font-serif font-light text-rust-900/10 select-none pointer-events-none leading-none lg:block">
        {firstName[0]}{secondName[0]}
      </div>

      <div className="relative mx-auto grid min-h-[80vh] max-w-6xl items-center gap-8 sm:gap-12 lg:gap-16 px-6 sm:px-10 lg:grid-cols-[1fr_1fr] lg:px-16 z-10">
        <div className="order-2 opacity-0 animate-[fadeUp_1200ms_ease-out_100ms_forwards] lg:order-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-rust-300 sm:tracking-[0.42em]">
            Hari Bahagia Kami
          </p>
          <h2 className="mt-8 max-w-2xl break-words font-serif text-4xl sm:text-7xl font-light leading-[1.0] sm:leading-[0.95] tracking-normal text-rust-100 [overflow-wrap:anywhere] lg:text-8xl">
            {firstName}
            <span className="my-4 block font-serif text-4xl font-extralight italic text-rust-300 sm:text-5xl lg:text-6xl">&amp;</span>
            {secondName}
          </h2>
          <div className="mt-8 h-px w-12 bg-rust-300/40" />
          <p className="mt-6 font-sans text-sm font-light leading-relaxed tracking-wide text-rust-100/60">
            Dua jiwa, satu ikrar, dan sebuah perjalanan baru yang kami mulai dengan nama-Nya.
          </p>

          <button
            type="button"
            onClick={() => {
              document.getElementById("rsvp")?.scrollIntoView({ behavior: preferredScrollBehavior() });
            }}
            className={`${BUTTON_PRIMARY_CLASS} mt-8 bg-rust-200 hover:bg-rust-100`}
          >
            Reservasi Sekarang
          </button>
        </div>

        {/* Asymmetrical Overlapping Arch Frame Layout */}
        <div className="order-1 relative opacity-0 animate-[fadeUp_1200ms_ease-out_250ms_forwards] lg:order-2 flex flex-col items-center">
          {/* Beautiful tall arch image frame with glow */}
          <div className="relative w-72 sm:w-80">
            {/* Glow / Soft Shadow */}
            <div className="absolute inset-0 bg-rust-500/20 blur-[80px] rounded-t-full" />

            <div className="relative h-[400px] sm:h-[460px] overflow-hidden border border-rust-300/20 shadow-[0_22px_56px_rgba(0,0,0,0.32)] arch-frame-md">
              <Image
                src={heroImageUrl || DEFAULT_HERO_IMAGE}
                alt="Potret pasangan pengantin"
                fill
                sizes="(max-width: 1024px) 320px, 400px"
                className="object-cover object-[center_20%] transition-transform duration-[10000ms] hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/70 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 animate-[fadeUp_1200ms_ease-out_800ms_forwards] z-10 pointer-events-none hidden sm:flex">
        <span className="mb-3 font-sans text-[7px] uppercase tracking-[0.32em] text-rust-300/50">Scroll</span>
        <div className="w-px h-16 bg-rust-300/10 relative overflow-hidden">
          <div className="w-full h-1/3 bg-rust-300/60 absolute top-0 left-0 animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}

// FlipDigit — angka beranimasi flip saat berubah
function FlipDigit({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlipping(true);
      const t = window.setTimeout(() => {
        setDisplayValue(value);
        setFlipping(false);
      }, 250);
      prevRef.current = value;
      return () => window.clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      key={flipping ? "flip" : "idle"}
      className={`font-serif text-5xl font-light text-rust-700 tabular-nums inline-block ${flipping ? "flip-digit" : ""}`}
      suppressHydrationWarning
    >
      {String(displayValue).padStart(2, "0")}
    </span>
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
    <section className="bg-luxury-cream px-6 py-24 sm:px-10 border-t border-rust-300/10 relative overflow-hidden">
      <LeafOrnament className="absolute left-[-40px] bottom-[-20px] text-rust-500 pointer-events-none animate-float-slow opacity-15 rotate-45" />

      <div className="mx-auto max-w-5xl text-center relative z-10">
        <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-rust-700 sm:tracking-[0.4em]">
          Menuju Hari Bahagia
        </p>

        {countdown.completed ? (
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px bg-gradient-to-l from-rust-300/40 to-transparent" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-rust-400/60 flex-shrink-0">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-r from-rust-300/40 to-transparent" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-luxury-dark">
              Hari Bahagia Telah Berlangsung
            </h2>
            <p className="font-sans text-sm font-light text-luxury-dark/55 max-w-sm leading-relaxed">
              Terima kasih atas doa dan kehadiran yang telah menemani hari istimewa kami.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {items.map(([label, value]) => (
              <div
                key={label}
                data-stagger
                className={`glass-premium-light arch-frame-sm px-6 pb-8 pt-10 text-center ${CARD_LIFT_LIGHT_CLASS}`}
              >
                <FlipDigit value={value} />
                <div className="mx-auto mt-4 mb-2.5 h-px w-8 bg-rust-300/40" />
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-rust-500 font-semibold">
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

// Icon per jenis sesi — fallback ke ikon generik ring
function SessionIcon({ name, index }: { name: string; index: number }) {
  const lower = name.toLowerCase();

  // Akad / nikah → ring icon
  if (lower.includes("akad") || lower.includes("ijab") || lower.includes("nikah")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v1M12 19v1M4 12h1M19 12h1" />
      </svg>
    );
  }

  // Resepsi / pesta → flower/bloom icon
  if (lower.includes("resepsi") || lower.includes("pesta") || lower.includes("reception")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 9 5 9 8a3 3 0 006 0c0-3-3-6-3-6z" />
        <path d="M12 22C12 22 9 19 9 16a3 3 0 006 0c0 3-3 6-3 6z" />
        <path d="M2 12C2 12 5 9 8 9a3 3 0 010 6c-3 0-6-3-6-3z" />
        <path d="M22 12C22 12 19 9 16 9a3 3 0 000 6c3 0 6-3 6-3z" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  // Siraman / pemberkatan → water drop icon
  if (lower.includes("siraman") || lower.includes("pemberkatan") || lower.includes("blessing")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L6 10a6 6 0 1012 0L12 2z" />
      </svg>
    );
  }

  // Fallback: numbered roman-like ornament
  const roman = ["I", "II", "III", "IV", "V"][index] ?? String(index + 1);
  return (
    <span className="font-serif text-sm font-light italic text-rust-500">{roman}</span>
  );
}

function EventDetails({ sessions }: { sessions: EventSession[] }) {
  return (
    <section className="bg-luxury-cream px-6 py-24 sm:px-10 border-t border-rust-300/10 relative overflow-hidden">
      <LeafOrnament className="absolute right-[-40px] top-[-10px] text-rust-500 pointer-events-none animate-float-slow-reverse opacity-15 -rotate-45" />

      <div className="mx-auto max-w-4xl relative z-10">
        <SectionHeading
          eyebrow="Rangkaian Acara"
          title="Kehadiran Anda adalah Kebahagiaan Kami"
          description="Dengan segala hormat, kami mengundang Bapak/Ibu/Saudara(i) untuk menghadiri dan mengiringi langkah baru kami."
        />

        {/* Timeline container */}
        <div className="mt-14 relative">

          {/* Vertical connector line — center on desktop, left on mobile */}
          {sessions.length > 1 && (
            <>
              {/* Mobile: left-side line */}
              <div className="absolute left-[19px] top-10 bottom-10 w-px bg-gradient-to-b from-rust-300/60 via-rust-300/30 to-rust-300/10 md:hidden" aria-hidden="true" />
              {/* Desktop: center line */}
              <div className="absolute left-1/2 -translate-x-px top-10 bottom-10 w-px bg-gradient-to-b from-rust-300/60 via-rust-300/30 to-rust-300/10 hidden md:block" aria-hidden="true" />
            </>
          )}

          <div className="space-y-8 md:space-y-0">
            {sessions.map((session, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={session.id}
                  className="relative md:grid md:grid-cols-[1fr_auto_1fr] md:gap-0 md:items-start md:mb-14 last:md:mb-0"
                >
                  {/* Desktop left slot — content if even, empty if odd */}
                  <div className={`hidden md:block ${isEven ? "pr-10 text-right" : ""}`}>
                    {isEven && (
                      <div data-stagger>
                        <EventCard session={session} align="right" />
                      </div>
                    )}
                  </div>

                  {/* Desktop node — icon + glow */}
                  <div className="hidden md:flex flex-col items-center relative z-10 px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rust-300/50 bg-luxury-cream text-rust-500 shadow-[0_4px_20px_rgba(200,122,101,0.28),0_0_0_4px_rgba(200,122,101,0.07)]">
                      <SessionIcon name={session.name} index={index} />
                    </div>
                    {/* Step number below dot */}
                    <span className="mt-2 font-sans text-[9px] uppercase tracking-[0.22em] text-rust-400/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Desktop right slot */}
                  <div className={`hidden md:block ${!isEven ? "pl-10" : ""}`}>
                    {!isEven && (
                      <div data-stagger>
                        <EventCard session={session} align="left" />
                      </div>
                    )}
                  </div>

                  {/* Mobile layout — icon + card side by side */}
                  <div className="flex gap-4 md:hidden">
                    {/* Mobile node */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-rust-300/45 bg-white text-rust-500 shadow-[0_4px_16px_rgba(200,122,101,0.22),0_0_0_3px_rgba(200,122,101,0.08)] relative z-10">
                        <SessionIcon name={session.name} index={index} />
                      </div>
                      <span className="mt-2 font-sans text-[9px] uppercase tracking-[0.15em] text-rust-400/50">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Mobile card */}
                    <div data-stagger className="flex-1 min-w-0 pb-2">
                      <EventCard session={session} align="left" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function EventCard({
  session,
  align,
}: {
  session: EventSession;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <article
      className={`relative rounded-2xl px-5 sm:px-7 py-8 flex flex-col overflow-hidden
        glass-premium-light
        ${isRight ? "text-right items-end" : "text-left items-start"}
        ${CARD_LIFT_LIGHT_CLASS}`}
    >
      {/* Accent strip top */}
      <div className={`absolute top-0 h-[3px] w-16 rounded-b-full bg-gradient-to-r from-rust-500/70 to-rust-300/10 ${isRight ? "right-7" : "left-7"}`} />

      {/* Subtle corner ornament */}
      <div
        className={`pointer-events-none absolute bottom-0 ${isRight ? "left-0" : "right-0"} w-20 h-20 rounded-tr-[100%] bg-gradient-to-tl from-rust-200/[0.12] to-transparent`}
        aria-hidden
      />

      {/* Session label */}
      <p className="mt-4 font-sans text-[10px] font-semibold uppercase tracking-[0.36em] text-rust-500">
        {session.name}
      </p>

      {/* Date — most prominent */}
      <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-luxury-dark leading-snug">
        {formatDate(session.starts_at)}
      </h3>

      {/* Thin rule */}
      <div className={`mt-4 mb-4 h-px w-10 bg-rust-300/40 ${isRight ? "ml-auto" : ""}`} />

      {/* Time */}
      <div className={`flex items-center gap-2 ${isRight ? "flex-row-reverse" : ""}`}>
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rust-100/80">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-rust-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p className="font-sans text-sm font-medium tracking-wide text-rust-700">
          {formatTime(session.starts_at)}
          {session.ends_at ? ` – ${formatTime(session.ends_at)}` : ""}
        </p>
      </div>

      {/* Venue */}
      {session.venue_name ? (
        <div className={`mt-4 flex items-start gap-2.5 ${isRight ? "flex-row-reverse" : ""}`}>
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rust-100/80 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-rust-500">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div>
            <p className="font-serif text-base font-medium text-luxury-dark leading-snug">
              {session.venue_name}
            </p>
            {session.address ? (
              <p className="mt-1 font-sans text-[12px] font-normal leading-relaxed text-luxury-dark/65 max-w-[200px] sm:max-w-xs">
                {session.address}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Maps button — enhanced with icon */}
      {session.maps_url ? (
        <a
          href={session.maps_url}
          target="_blank"
          rel="noreferrer"
          className={`mt-6 inline-flex items-center gap-2 rounded-full border border-rust-500/50 bg-rust-50/60 px-5 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-rust-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-rust-500 hover:bg-rust-500 hover:text-luxury-cream active:translate-y-0 cursor-pointer shadow-[0_2px_10px_rgba(200,122,101,0.12)] ${isRight ? "self-end" : "self-start"}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Buka Lokasi
        </a>
      ) : null}
    </article>
  );
}

// Per-photo object-position tuning, index 0-5 maps to gallery items.
const GALLERY_OBJECT_POSITIONS: Record<number, string> = {
  0: "center 25%",   // gallery-1
  1: "center 35%",   // gallery-3: ayunan teardrop
  2: "center 20%",   // gallery-5
  3: "center 50%",   // gallery-2
  4: "center 25%",   // gallery-6
  5: "center 30%",   // gallery-4
};

function GallerySection({ galleries }: { galleries: GalleryImage[] }) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="bg-luxury-dark px-6 py-24 text-rust-100 sm:px-10 relative overflow-hidden">
      <div className="mx-auto max-w-6xl relative z-10">
        <SectionHeading
          eyebrow="Galeri"
          title="Cerita Kita Dalam Lensa"
          description="Sekilas potret perjalanan dan tawa yang menemani langkah kami menuju hari bahagia."
          inverted
        />

        {/* Grid — mobile: 2 kolom urutan [1,3,2,5,4,6], md+: 3 kolom urutan natural 1-6 */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 [grid-auto-rows:160px] md:[grid-auto-rows:340px]">
          {galleries[0] && (
            <GalleryCard image={galleries[0]} objPos={GALLERY_OBJECT_POSITIONS[0]} onClick={() => setActiveImageIndex(0)} className="rounded-xl cursor-pointer order-1 md:order-none" />
          )}
          {galleries[1] && (
            <GalleryCard image={galleries[1]} objPos={GALLERY_OBJECT_POSITIONS[1]} onClick={() => setActiveImageIndex(1)} className="rounded-xl cursor-pointer border border-rust-300/20 md:border-2 md:border-rust-300/30 md:shadow-[0_14px_34px_rgba(223,176,158,0.12)] order-3 md:order-none" />
          )}
          {galleries[2] && (
            <GalleryCard image={galleries[2]} objPos={GALLERY_OBJECT_POSITIONS[2]} onClick={() => setActiveImageIndex(2)} className="rounded-xl cursor-pointer order-2 md:order-none" />
          )}
          {galleries[3] && (
            <GalleryCard image={galleries[3]} objPos={GALLERY_OBJECT_POSITIONS[3]} onClick={() => setActiveImageIndex(3)} className="rounded-xl cursor-pointer order-5 md:order-none" />
          )}
          {galleries[4] && (
            <GalleryCard image={galleries[4]} objPos={GALLERY_OBJECT_POSITIONS[4]} onClick={() => setActiveImageIndex(4)} className="rounded-xl cursor-pointer order-4 md:order-none" />
          )}
          {galleries[5] && (
            <GalleryCard image={galleries[5]} objPos={GALLERY_OBJECT_POSITIONS[5]} onClick={() => setActiveImageIndex(5)} className="rounded-xl cursor-pointer order-6 md:order-none" />
          )}
        </div>
      </div>

      {activeImageIndex !== null && (
        <GalleryLightbox
          images={galleries}
          currentIndex={activeImageIndex}
          onClose={() => setActiveImageIndex(null)}
          onNavigate={(newIndex) => setActiveImageIndex(newIndex)}
        />
      )}
    </section>
  );
}

function GalleryCard({
  image,
  objPos,
  onClick,
  className = "",
}: {
  image: GalleryImage;
  objPos: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <figure
      data-stagger
      onClick={onClick}
      className={`group relative overflow-hidden border border-rust-300/10 bg-luxury-dark ${CARD_LIFT_DARK_CLASS} ${className}`}
    >
      <Image
        src={image.image_url}
        alt={image.alt_text || "Galeri pernikahan"}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ objectPosition: objPos }}
      />
    </figure>
  );
}

function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const current = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 animate-[fadeIn_300ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-5xl w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup foto"
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-rust-100 hover:bg-white/20 transition-all cursor-pointer z-20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            aria-label="Foto sebelumnya"
            className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-white/15 text-rust-100 hover:bg-rust-900 transition-all cursor-pointer z-20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-rust-300/20 shadow-2xl">
          <Image
            src={current.image_url}
            alt={current.alt_text || "Foto galeri pernikahan"}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            aria-label="Foto selanjutnya"
            className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-white/15 text-rust-100 hover:bg-rust-900 transition-all cursor-pointer z-20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 backdrop-blur-sm">
          <span className="font-sans text-xs font-semibold tracking-widest text-rust-300">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Format nomor rekening sesuai konvensi bank
function formatAccountNumber(provider: string, number: string): string {
  const lower = provider.toLowerCase();

  if (lower.includes("mandiri")) {
    // 13 digit → 4-4-5 misal: 1300 0281 30048
    return number.replace(/^(\d{4})(\d{4})(\d{5})$/, "$1 $2 $3");
  }

  if (lower.includes("bni")) {
    // 10 digit → 3-3-4 misal: 194 689 5318
    return number.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
  }

  if (lower.includes("bca")) {
    // 10 digit → 3-3-4
    return number.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
  }

  if (lower.includes("bri")) {
    // 15 digit → 4-5-6
    return number.replace(/^(\d{4})(\d{5})(\d{6})$/, "$1 $2 $3");
  }

  // Fallback: setiap 4 digit
  return number.replace(/(\d{4})(?=\d)/g, "$1 ");
}
function getBankConfig(provider: string): {
  bg: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  logo: React.ReactNode;
} {
  const lower = provider.toLowerCase();

  if (lower.includes("mandiri")) {
    return {
      bg: "bg-[#003f88]",
      accent: "bg-[#f5a800]",
      textPrimary: "text-white",
      textSecondary: "text-white/70",
      borderColor: "border-white/10",
      logo: (
        <div className="flex flex-col items-start gap-1">
          {/* Mandiri wave ornament */}
          <svg width="52" height="14" viewBox="0 0 52 14" fill="none">
            <path
              d="M2 10 C8 2, 14 2, 20 7 C26 12, 32 12, 38 7 C44 2, 50 2, 52 4"
              stroke="#f5a800"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="font-sans text-xl font-bold tracking-tight text-white leading-none">
            mandiri
          </span>
        </div>
      ),
    };
  }

  if (lower.includes("bni")) {
    return {
      bg: "bg-white",
      accent: "bg-[#e8600a]",
      textPrimary: "text-[#1a6e72]",
      textSecondary: "text-[#1a6e72]/60",
      borderColor: "border-[#1a6e72]/15",
      logo: (
        <div className="flex items-center gap-2.5">
          {/* BNI square icon */}
          <div className="relative w-9 h-9 bg-[#e8600a] rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="16" cy="14" r="7" stroke="white" strokeWidth="2" fill="none" />
              <line x1="6" y1="6" x2="22" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-sans text-2xl font-black tracking-tight text-[#1a6e72] leading-none">
            BNI
          </span>
        </div>
      ),
    };
  }

  // Fallback generic
  return {
    bg: "bg-luxury-dark",
    accent: "bg-rust-500",
    textPrimary: "text-rust-100",
    textSecondary: "text-rust-300/70",
    borderColor: "border-rust-300/15",
    logo: (
      <span className="font-sans text-lg font-bold tracking-wide text-rust-100">
        {provider}
      </span>
    ),
  };
}

function GiftSection({ giftAccounts }: { giftAccounts: GiftAccount[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyAccount(gift: GiftAccount) {
    await navigator.clipboard.writeText(gift.account_number);
    setCopiedId(gift.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <section id="gift" className="bg-luxury-cream px-6 py-24 sm:px-10 relative overflow-hidden">
      <div className="mx-auto max-w-5xl relative z-10">
        <SectionHeading
          eyebrow="Tanda Kasih"
          title="Doa Restu Anda Adalah Hadiah Terindah"
          description="Kehadiran dan doa Anda sudah sangat berarti bagi kami. Namun, jika Anda ingin memberikan tanda kasih, Anda dapat menggunakan informasi di bawah ini."
        />
        <div className="mt-12 grid gap-4 sm:gap-6 md:grid-cols-2">
          {giftAccounts.length > 0 ? (
            giftAccounts.map((gift) => {
              const bank = getBankConfig(gift.provider);
              const isCopied = copiedId === gift.id;
              return (
                <article
                  key={gift.id}
                  data-stagger
                  className={`relative overflow-hidden rounded-2xl ${bank.bg} border ${bank.borderColor} shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]`}
                >
                  {/* Accent bar kiri */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${bank.accent}`} />

                  <div className="px-3 sm:px-5 lg:px-8 py-5 sm:py-7 lg:py-8">
                    {/* Logo bank */}
                    <div className="mb-4 sm:mb-8">
                      {bank.logo}
                    </div>

                    {/* Nomor rekening */}
                    <p className={`font-mono text-base sm:text-2xl lg:text-3xl font-bold tracking-widest ${bank.textPrimary} leading-none break-all`}>
                      {formatAccountNumber(gift.provider, gift.account_number)}
                    </p>

                    {/* Nama penerima */}
                    <div className={`mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 ${bank.textSecondary}`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 hidden sm:block">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <p className={`font-sans text-[11px] sm:text-sm font-semibold tracking-wide ${bank.textPrimary} truncate`}>
                        {gift.account_name}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className={`mt-4 sm:mt-6 mb-4 sm:mb-6 h-px w-full opacity-10 ${bank.accent}`} />

                    {/* Tombol salin — full width di mobile */}
                    <button
                      type="button"
                      onClick={() => copyAccount(gift)}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-6 py-2.5 font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 cursor-pointer
                        ${isCopied
                          ? "bg-[#4caf50]/20 text-[#4caf50] border border-[#4caf50]/40"
                          : `border ${bank.borderColor} ${bank.textSecondary} hover:opacity-80`
                        }`}
                    >
                      {isCopied ? (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Tersalin
                        </>
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Salin
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="col-span-1 font-sans text-sm text-luxury-dark/50">Informasi tanda kasih belum tersedia.</p>
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
  existingRsvp,
}: {
  invitationId: string;
  slug: string;
  defaultName: string;
  existingRsvp: ExistingRsvp | null;
}) {
  const [state, formAction, pending] = useActionState(submitRsvp, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [submittedName, setSubmittedName] = useState(existingRsvp?.name ?? "");
  const [submittedStatus, setSubmittedStatus] = useState(existingRsvp?.attendance_status ?? "attending");
  const [attendanceStatus, setAttendanceStatus] = useState<"attending" | "not_attending">(
    existingRsvp?.attendance_status ?? "attending"
  );
  const [paxCount, setPaxCount] = useState<number>(
    existingRsvp?.pax && existingRsvp.pax > 0 ? existingRsvp.pax : 1
  );
  const [isEditing, setIsEditing] = useState(false);

  const showSuccess = (Boolean(existingRsvp) || state.status === "success") && !isEditing;

  useEffect(() => {
    if (state.status === "success") {
      setIsEditing(false);
    }
  }, [state.status]);

  return (
    <section id="rsvp" className="bg-luxury-cream px-6 py-24 sm:px-10 border-t border-rust-300/10 relative overflow-hidden">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[0.9fr_1.1fr] relative z-10">
        <SectionHeading
          eyebrow="Reservasi"
          title="Konfirmasi Kehadiran Anda"
          description="Suatu kebahagiaan jika Anda dapat hadir. Silakan beri tahu kami rencana kedatangan Anda melalui form berikut."
        />
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(e) => {
            const nameInput = (e.currentTarget.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
            if (nameInput) setSubmittedName(nameInput);
            setSubmittedStatus(attendanceStatus);
          }}
          className={`glass-premium-light rounded-xl p-6 sm:p-8 lg:p-10 ${CARD_LIFT_LIGHT_CLASS}`}
        >
          <input type="hidden" name="invitationId" value={invitationId} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="guestName" value={defaultName} />

          {showSuccess ? (
            <div className="flex flex-col items-center py-8 text-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-rust-300/40 bg-luxury-dark/5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-rust-600">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-xl font-light text-luxury-dark">
                  Terima kasih{submittedName || defaultName ? `, ${submittedName || defaultName}` : ""}!
                </p>
                <p className="mt-2 font-sans text-sm font-light leading-relaxed text-luxury-dark/60">
                  Konfirmasi kehadiran Anda sudah kami terima.<br />
                  {submittedStatus === "not_attending"
                    ? "Kami memahami dan berterima kasih atas doa restu Anda."
                    : "Silakan datang tepat waktu, kami tunggu kehadiran Anda."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`${BUTTON_OUTLINE_CLASS} mt-2`}
              >
                Ubah Konfirmasi Kehadiran
              </button>
            </div>
          ) : (
            <>
              <Field label="Nama" name="name" defaultValue={submittedName || defaultName} required />

              <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-800">
                Kehadiran
                <select
                  name="attendanceStatus"
                  required
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value as "attending" | "not_attending")}
                  className={FORM_FIELD_LIGHT_CLASS}
                >
                  <option value="attending">Hadir</option>
                  <option value="not_attending">Berhalangan hadir</option>
                </select>
              </label>

              {attendanceStatus === "attending" ? (
                <div className="mt-6">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-rust-800">
                    Jumlah Tamu
                  </label>
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setPaxCount((prev) => Math.max(1, prev - 1))}
                      disabled={paxCount <= 1}
                      aria-label="Kurangi jumlah tamu"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-rust-300/50 bg-white/70 text-rust-800 transition-all hover:bg-rust-300/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <span className="min-w-20 text-center font-serif text-2xl font-light text-luxury-dark">
                      {paxCount} <span className="font-sans text-xs font-medium uppercase tracking-wider text-rust-600">Tamu</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPaxCount((prev) => Math.min(10, prev + 1))}
                      disabled={paxCount >= 10}
                      aria-label="Tambah jumlah tamu"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-rust-300/50 bg-white/70 text-rust-800 transition-all hover:bg-rust-300/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <input type="hidden" name="pax" value={paxCount} />
                  </div>
                </div>
              ) : (
                <input type="hidden" name="pax" value="0" />
              )}

              <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-800">
                Catatan
                <textarea
                  name="note"
                  rows={4}
                  maxLength={300}
                  defaultValue={existingRsvp?.note ?? ""}
                  className={`${FORM_FIELD_LIGHT_CLASS} py-2`}
                  placeholder="Opsional"
                />
              </label>

              <FormMessage state={state} />

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className={`${BUTTON_DARK_CLASS} flex-1 w-full px-5 py-4`}
                >
                  {pending ? "Mengirim..." : existingRsvp || state.status === "success" ? "Simpan Perubahan" : "Kirim Konfirmasi"}
                </button>
                {(Boolean(existingRsvp) || state.status === "success") && isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={`${BUTTON_OUTLINE_CLASS} w-full sm:w-auto px-5 py-3.5`}
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </>
          )}
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
  const [optimisticWishes, setOptimisticWishes] = useState<Wish[]>(wishes);
  const [messageText, setMessageText] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (state.status === "success") {
      setMessageText("");
      formRef.current?.reset();
    } else if (state.status === "error") {
      setOptimisticWishes((prev) => prev.filter((w) => !w.id.startsWith("optimistic-")));
    }
  }, [state.status]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value?.trim();
    if (name && message) {
      const optimistic: Wish = {
        id: `optimistic-${Date.now()}`,
        invitation_id: invitationId,
        name,
        message,
        is_approved: true,
        created_at: new Date().toISOString(),
      };
      setOptimisticWishes((prev) => [optimistic, ...prev]);
    }
  }

  const displayedWishes = optimisticWishes.slice(0, visibleCount);
  const hasMore = optimisticWishes.length > visibleCount;

  return (
    <section
      id="wishes"
      className="bg-luxury-dark px-6 py-24 text-rust-100 sm:px-10 relative overflow-hidden"
    >
      {/* Background decorations */}
      <LeafOrnament className="absolute right-[-30px] bottom-[-20px] text-rust-400 pointer-events-none animate-float-slow opacity-15 rotate-12" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Heading + wishes count */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.34em] sm:tracking-[0.4em] text-rust-300">
              Ucapan &amp; Doa
            </p>
            <h2 className="mt-4 max-w-3xl break-words font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight text-rust-100">
              Pesan dan Harapan
            </h2>
            <p className="mt-4 max-w-2xl font-sans text-sm font-light leading-relaxed tracking-wide text-rust-200/80">
              Setiap doa, ucapan, pesan dan harapan hangat yang Anda berikan akan menjadi kado terindah serta kenangan berharga yang akan selalu kami simpan.
            </p>
          </div>
          {optimisticWishes.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-2 rounded-full border border-rust-300/20 bg-rust-300/5 px-4 py-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-rust-400/60">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-rust-300/80">
                {optimisticWishes.length} ucapan
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          {/* Form */}
          <form
            ref={formRef}
            action={formAction}
            onSubmit={handleSubmit}
            className={`glass-premium-dark rounded-xl p-6 sm:p-8 lg:p-10 ${CARD_LIFT_DARK_CLASS}`}
          >
            <input type="hidden" name="invitationId" value={invitationId} />
            <input type="hidden" name="slug" value={slug} />

            <Field label="Nama" name="name" defaultValue={defaultName} required tone="dark" />

            <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-rust-300">
              Ucapan
              <div className="relative mt-2">
                <textarea
                  name="message"
                  rows={5}
                  minLength={5}
                  maxLength={500}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className={`${FORM_FIELD_DARK_CLASS} py-2 pr-16 mt-0`}
                  placeholder="Tulis ucapan dan doa untuk kami..."
                />
                <span className="absolute bottom-3 right-2 font-sans text-[10px] tracking-wider text-rust-400/50 select-none">
                  {messageText.length} / 500
                </span>
              </div>
            </label>

            <FormMessage state={state} />

            <button
              type="submit"
              disabled={pending}
              className={`${BUTTON_PRIMARY_CLASS} mt-10 w-full px-5 py-4`}
            >
              {pending ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>

          {/* Wishes list */}
          <div className="space-y-4">
            {displayedWishes.length > 0 ? (
              <>
                {displayedWishes.map((wish) => {
                  const isOptimistic = wish.id.startsWith("optimistic-");
                  return (
                    <article
                      key={wish.id}
                      data-stagger
                      className={`glass-premium-dark rounded-xl border-l-2 border-l-rust-300/60 p-6 hover:bg-luxury-cream/5 ${CARD_LIFT_DARK_CLASS} ${isOptimistic ? "opacity-0 animate-[fadeUp_600ms_ease-out_forwards]" : ""
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-serif text-lg font-semibold text-rust-300">
                          {wish.name}
                          {isOptimistic && (
                            <span className="ml-2 font-sans text-[9px] uppercase tracking-wider text-rust-400/50 align-middle">
                              · baru
                            </span>
                          )}
                        </p>
                        <time className="flex-shrink-0 font-sans text-[9px] uppercase tracking-[0.18em] text-rust-400/50 mt-1">
                          {new Date(wish.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </time>
                      </div>
                      <p className="mt-3 font-sans text-sm font-light leading-relaxed text-rust-100/80">{wish.message}</p>
                    </article>
                  );
                })}

                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className={`${BUTTON_OUTLINE_CLASS} w-full mt-4 text-rust-300 border-rust-300/30 hover:bg-rust-300/10 hover:border-rust-300 hover:text-rust-100`}
                  >
                    Lihat Ucapan Lainnya ({optimisticWishes.length - visibleCount})
                  </button>
                )}
              </>
            ) : (
              <p className="rounded-xl border border-rust-300/10 p-8 text-center font-sans text-sm text-rust-200/50">
                Jadilah yang pertama mengirim ucapan.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingSection({ displayNames }: { displayNames: string }) {
  const currentYear = new Date().getFullYear();
  // Split on & or ♡ to get individual names
  const nameParts = displayNames.split(/\s*[&\u2661]\s*/);
  const brideName = nameParts[0]?.trim() || displayNames;
  const groomName = nameParts[1]?.trim() || '';

  return (
    <section className="relative overflow-hidden bg-luxury-cream px-6 pt-20 sm:pt-32 pb-28 sm:pb-36 text-center sm:px-10 border-t border-rust-300/10">
      {/* Soft radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(223,176,158,0.06),transparent_50%)] pointer-events-none" />

      {/* Decorative floating leaves */}
      <LeafOrnament className="absolute top-12 left-[5%] text-rust-500 pointer-events-none animate-float-slow opacity-[0.04] rotate-12 scale-110" />
      <LeafOrnament className="absolute bottom-16 right-[8%] text-rust-500 pointer-events-none animate-float-slow-reverse opacity-[0.04] -rotate-12 scale-125" />

      <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
        {/* Top ornamental divider */}
        <div className="flex items-center gap-4 w-full max-w-md mb-10">
          <div className="flex-1 h-px bg-gradient-to-l from-rust-300/40 to-transparent" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-rust-400/50 flex-shrink-0">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-r from-rust-300/40 to-transparent" />
        </div>

        {/* Heading */}
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.4em] text-rust-600 opacity-0 animate-[fadeUp_1000ms_ease-out_200ms_forwards]">
          Terima Kasih
        </p>

        {/* Names - focal point */}
        <div className="mt-8 flex flex-col items-center gap-0 opacity-0 animate-[fadeUp_1000ms_ease-out_400ms_forwards]">
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-luxury-dark tracking-wide">
            {brideName}
          </h2>
          {groomName && (
            <>
              <div className="my-2 text-rust-400/60 font-serif text-lg italic">♡</div>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-luxury-dark tracking-wide">
                {groomName}
              </h2>
            </>
          )}
        </div>

        {/* Elegant thin rule */}
        <div className="mt-10 mb-10 h-px w-20 bg-gradient-to-r from-transparent via-rust-300/50 to-transparent opacity-0 animate-[fadeUp_1000ms_ease-out_600ms_forwards]" />

        {/* Closing message */}
        <div className="space-y-6 opacity-0 animate-[fadeUp_1000ms_ease-out_800ms_forwards]">
          <p className="mx-auto max-w-2xl px-4 font-serif text-base sm:text-lg font-light italic leading-8 text-luxury-dark/75">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.
          </p>

          <p className="mx-auto max-w-xl px-4 font-sans text-sm font-light leading-7 tracking-wide text-luxury-dark/65">
            Terima kasih atas segala doa, dukungan, dan perhatian yang telah diberikan.
          </p>

          <p className="mx-auto max-w-xl px-4 font-sans text-sm font-medium leading-7 tracking-wide text-rust-700">
            Sampai jumpa di hari bahagia kami.
          </p>
        </div>

        {/* Bottom ornamental divider */}
        <div className="flex items-center gap-4 w-full max-w-md mt-16 mb-8 opacity-0 animate-[fadeUp_1000ms_ease-out_1000ms_forwards]">
          <div className="flex-1 h-px bg-gradient-to-l from-rust-300/40 to-transparent" />
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-rust-400/60 flex-shrink-0">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-r from-rust-300/40 to-transparent" />
        </div>

        {/* Copyright & credit */}
        <div className="mt-4 opacity-0 animate-[fadeUp_1000ms_ease-out_1200ms_forwards]">
          <p className="font-sans text-[11px] tracking-[0.15em] text-luxury-dark/45 font-medium">
            © {currentYear} Wedding Digital by Rizky Septiana S
          </p>
        </div>
      </div>
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

  useEffect(() => {
    if (!shouldStart || !musicUrl || isUnavailable) {
      return;
    }

    audioRef.current
      ?.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsUnavailable(true));
  }, [isUnavailable, musicUrl, shouldStart]);

  if (!musicUrl || isUnavailable) {
    return null;
  }

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  return (
    <audio ref={audioRef} src={musicUrl} loop preload="none" />
  );
}

// ScrollTopButton function retained but returns null to hide the floating button.
function ScrollTopButton() {
  return null;
}

function FloatingNav() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    ["Ayat", "quran"],
    ["Mempelai", "family"],
    ["Foto", "hero"],
    ["Acara", "events"],
    ["Galeri", "gallery"],
    ["Tanda", "gift"],
    ["Reservasi", "rsvp"],
    ["Ucapan", "wishes"],
  ] as const;

  return (
    // Gunakan top-1/2 + translateY(-50%) via CSS var, slide-in pakai left bukan translateX
    // supaya tidak konflik dengan centering transform
    <div
      className={`fixed top-1/2 z-30 hidden lg:block`}
      style={{
        transform: "translateY(-50%)",
        left: show ? "1.5rem" : "-8rem",
        transition: "left 300ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="flex flex-col gap-1 rounded-xl border border-rust-300/20 bg-luxury-dark/95 p-3 shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-md">
        {links.map(([label, target]) => (
          <a
            key={target}
            href={`#${target}`}
            className="premium-focus rounded px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-rust-300/80 transition duration-300 hover:bg-white/5 hover:text-rust-100"
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: preferredScrollBehavior() })}
          className="premium-focus mt-2 rounded border-t border-rust-300/20 pt-2 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-rust-200 transition duration-300 hover:bg-white/5 hover:text-rust-100 cursor-pointer"
        >
          Ke Atas
        </button>
      </div>
    </div>
  );
}

function MobileNav() {
  const [show, setShow] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200);

      const sections = ["quran", "family", "events", "gallery", "rsvp"];
      for (const s of sections.reverse()) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 300) {
          setActiveSection(s);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { id: "family", label: "Mempelai", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.318A5.278 5.278 0 0 0 8.204 3c-2.88 0-5.204 2.276-5.204 5.082 0 3.864 8.163 10.918 9 11.918.837-1 9-8.054 9-11.918C21 5.276 18.68 3 15.796 3 14.28 3 12.926 3.568 12 4.318z" /></svg> },
    { id: "events", label: "Acara", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
    { id: "gallery", label: "Galeri", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg> },
    { id: "rsvp", label: "RSVP", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10.002 10.002 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" /></svg> },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden`}
      style={{
        transform: show ? "translateY(0)" : "translateY(100%)",
        transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="flex items-center justify-around bg-luxury-dark/95 backdrop-blur-md border-t border-rust-300/20 px-2 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
        {links.map((link) => {
          const isActive = activeSection === link.id;
          return (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`flex flex-col items-center gap-1 transition-colors duration-300 ${isActive ? "text-rust-300" : "text-rust-200/50 hover:text-rust-200"}`}
            >
              {link.icon}
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest">{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function RevealSection({
  children,
  id,
  depth = "md",
}: {
  children: ReactNode;
  id?: string;
  depth?: "sm" | "md" | "lg";
}) {
  const depthClass =
    depth === "lg"
      ? "reveal-section reveal-depth-lg"
      : depth === "sm"
        ? "reveal-section reveal-depth-sm"
        : "reveal-section reveal-depth-md";

  return (
    <section id={id} data-reveal className={depthClass}>
      {children}
    </section>
  );
}

function useRevealObserver(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            // Stagger children yang punya data-stagger
            const children = Array.from(
              (entry.target as HTMLElement).querySelectorAll<HTMLElement>("[data-stagger]")
            );
            children.forEach((child, i) => {
              child.style.animationDelay = `${i * 100}ms`;
              child.classList.add("animate-fade-up-sm");
            });

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [enabled]);
}

function useScrollParallax(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 768
    ) {
      root.style.setProperty("--scroll-y", "0");
      return;
    }

    let ticking = false;

    const update = () => {
      root.style.setProperty("--scroll-y", `${window.scrollY}`);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [rootRef]);
}

function SectionHeading({
  eyebrow,
  title,
  description,
  inverted,
  compact,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="mb-10">
      <p
        data-stagger
        className={`font-sans text-[11px] font-semibold uppercase tracking-[0.34em] sm:tracking-[0.4em] ${inverted ? "text-rust-300" : "text-rust-600"}`}
      >
        {eyebrow}
      </p>
      <h2
        data-stagger
        className={`mt-4 max-w-3xl break-words font-serif font-light leading-tight [overflow-wrap:anywhere] ${compact
          ? "text-2xl sm:text-4xl lg:text-5xl"
          : "text-4xl sm:text-5xl"
          } ${inverted ? "text-rust-100" : "text-luxury-dark"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          data-stagger
          className={`mt-4 max-w-2xl font-sans text-sm font-light leading-relaxed tracking-wide ${inverted ? "text-rust-200/80" : "text-luxury-dark/70"}`}
        >
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
  tone = "light",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: string;
  max?: string;
  tone?: "light" | "dark";
}) {
  const inputId = useMemo(
    () => `${name}-${label.toLowerCase().replace(/\s+/g, "-")}`,
    [label, name]
  );
  const labelClass = tone === "dark" ? "text-rust-300" : "text-rust-800";
  const fieldClass = tone === "dark" ? FORM_FIELD_DARK_CLASS : FORM_FIELD_LIGHT_CLASS;

  return (
    <label
      htmlFor={inputId}
      className={`mt-6 block text-xs font-semibold uppercase tracking-widest first:mt-0 ${labelClass}`}
    >
      {label}
      <input
        id={inputId}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        max={max}
        className={fieldClass}
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
