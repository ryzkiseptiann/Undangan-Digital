import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationExperience } from "@/components/invitation/InvitationExperienceMotion";
import { getExistingRsvpForGuest, getInvitationBySlug } from "@/lib/invitations";

type InvitationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
};

// Cache the page for 60 seconds (ISR) — re-fetch from Supabase only when stale.
// This makes repeat visits near-instant while keeping data reasonably fresh.
export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: InvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { to } = await searchParams;
  const detail = await getInvitationBySlug(slug);

  if (!detail) {
    return {
      title: "Undangan Tidak Ditemukan",
      robots: { index: false },
    };
  }

  const { invitation } = detail;
  const guestName = to ? decodeURIComponent(to) : "";
  const pageTitle = guestName
    ? `Undangan Pernikahan ${invitation.display_names} untuk ${guestName}`
    : invitation.title;

  const description = guestName
    ? `Kepada Yth. ${guestName}, kami mengundang Anda untuk menghadiri pernikahan ${invitation.display_names}.`
    : (invitation.opening_text?.slice(0, 160) ??
      `Anda diundang ke pernikahan ${invitation.display_names}. Klik untuk membuka undangan digital.`);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
          ? process.env.NEXT_PUBLIC_SITE_URL
          : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const rawCover = invitation.hero_image_url || "/images/demo/gallery-2.jpg";
  const coverImageUrl = rawCover.startsWith("http")
    ? rawCover
    : `${baseUrl}${rawCover.startsWith("/") ? "" : "/"}${rawCover}`;

  const ogImages = [
    {
      url: coverImageUrl,
      secureUrl: coverImageUrl,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: `Undangan pernikahan ${invitation.display_names}`,
    },
  ];

  return {
    title: pageTitle,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title: pageTitle,
      description,
      url: `${baseUrl}/u/${slug}${to ? `?to=${encodeURIComponent(to)}` : ""}`,
      images: [
        {
          url: coverImageUrl,
          secureUrl: coverImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: `Undangan pernikahan ${invitation.display_names}`,
        },
      ],
      locale: "id_ID",
      siteName: "Undangan Digital",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [
        {
          url: coverImageUrl,
          alt: `Undangan pernikahan ${invitation.display_names}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function InvitationPage({
  params,
  searchParams,
}: InvitationPageProps) {
  const { slug } = await params;
  const { to } = await searchParams;
  const detail = await getInvitationBySlug(slug);

  if (!detail) {
    notFound();
  }

  const guestName = to ? decodeURIComponent(to) : "Tamu Undangan";
  const existingRsvp = await getExistingRsvpForGuest(
    detail.invitation.id,
    guestName === "Tamu Undangan" ? "" : guestName
  );

  return <InvitationExperience detail={detail} guestName={guestName} existingRsvp={existingRsvp} />;
}
