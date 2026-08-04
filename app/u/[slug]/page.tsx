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
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getInvitationBySlug(slug);

  if (!detail) {
    return {
      title: "Undangan Tidak Ditemukan",
      robots: { index: false },
    };
  }

  const { invitation } = detail;
  const description =
    invitation.opening_text?.slice(0, 160) ??
    `Anda diundang ke pernikahan ${invitation.display_names}. Klik untuk membuka undangan digital.`;

  const ogImages = invitation.hero_image_url
    ? [
        {
          url: invitation.hero_image_url,
          width: 1200,
          height: 630,
          alt: `Undangan pernikahan ${invitation.display_names}`,
        },
      ]
    : [];

  return {
    title: invitation.title,
    description,
    // Sembunyikan dari mesin pencari — undangan bersifat personal
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title: invitation.title,
      description,
      images: ogImages,
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title: invitation.title,
      description,
      images: ogImages.map((img) => img.url),
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
