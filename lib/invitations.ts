import { supabase } from "@/lib/supabase-server";
import type {
  EventSession,
  ExistingRsvp,
  GalleryImage,
  GiftAccount,
  Invitation,
  InvitationDetail,
  Wish,
} from "@/types/invitation";

const demoGalleries: GalleryImage[] = [
  {
    id: "demo-gallery-1",
    invitation_id: "demo",
    image_url: "/images/demo/gallery-1.jpg",
    alt_text: "Momen bersama di antara patung Bali",
    sort_order: 1,
  },
  {
    id: "demo-gallery-3",
    invitation_id: "demo",
    image_url: "/images/demo/gallery-3.jpg",
    alt_text: "Duduk bersama di ayunan teardrop Bedugul",
    sort_order: 2,
  },
  {
    id: "demo-gallery-5",
    invitation_id: "demo",
    image_url: "/images/demo/gallery-5.jpg",
    alt_text: "Potret berdua close-up romantis",
    sort_order: 3,
  },
  {
    id: "demo-gallery-2",
    invitation_id: "demo",
    image_url: "/images/demo/gallery-2.jpg",
    alt_text: "Berdua di dermaga tepi danau",
    sort_order: 4,
  },
  {
    id: "demo-gallery-6",
    invitation_id: "demo",
    image_url: "/images/demo/gallery-6.jpg",
    alt_text: "Potret berdua bersandar mesra",
    sort_order: 5,
  },
  {
    id: "demo-gallery-4",
    invitation_id: "demo",
    image_url: "/images/demo/gallery-4.jpg",
    alt_text: "Senyum bahagia di bawah payung Bali",
    sort_order: 6,
  },
];

export async function getInvitationBySlug(
  slug: string
): Promise<InvitationDetail | null> {
  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<Invitation>();

  if (invitationError || !invitation) {
    return null;
  }

  const [sessionsResult, galleriesResult, giftAccountsResult, wishesResult] =
    await Promise.all([
      supabase
        .from("event_sessions")
        .select("*")
        .eq("invitation_id", invitation.id)
        .order("sort_order", { ascending: true })
        .returns<EventSession[]>(),
      supabase
        .from("galleries")
        .select("*")
        .eq("invitation_id", invitation.id)
        .order("sort_order", { ascending: true })
        .returns<GalleryImage[]>(),
      supabase
        .from("gift_accounts")
        .select("*")
        .eq("invitation_id", invitation.id)
        .order("sort_order", { ascending: true })
        .returns<GiftAccount[]>(),
      supabase
        .from("wishes")
        .select("*")
        .eq("invitation_id", invitation.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(12)
        .returns<Wish[]>(),
    ]);

  const hasSectionError =
    sessionsResult.error ||
    galleriesResult.error ||
    giftAccountsResult.error ||
    wishesResult.error;

  if (hasSectionError) {
    throw new Error("Failed to load invitation sections from Supabase");
  }

  return {
    invitation,
    sessions: sessionsResult.data ?? [],
    galleries:
      galleriesResult.data && galleriesResult.data.length > 0
        ? galleriesResult.data
        : demoGalleries.map((gallery) => ({
          ...gallery,
          invitation_id: invitation.id,
        })),
    giftAccounts: giftAccountsResult.data ?? [],
    wishes: wishesResult.data ?? [],
  };
}

export async function getExistingRsvpForGuest(
  invitationId: string,
  guestName: string
): Promise<ExistingRsvp | null> {
  if (!guestName) return null;

  const { data, error } = await supabase
    .from("rsvps")
    .select("name, attendance_status, pax, note")
    .eq("invitation_id", invitationId)
    .eq("name", guestName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<ExistingRsvp>();

  if (error) throw new Error("Failed to load guest RSVP status");
  return data;
}
