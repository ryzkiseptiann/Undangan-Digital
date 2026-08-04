export type Invitation = {
  id: string;
  slug: string;
  event_type: string;
  title: string;
  bride_name: string | null;
  groom_name: string | null;
  display_names: string;
  opening_text: string | null;
  quote: string | null;
  main_event_at: string;
  hero_image_url: string | null;
  bride_photo_url: string | null;
  groom_photo_url: string | null;
  music_url: string | null;
  theme: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type EventSession = {
  id: string;
  invitation_id: string;
  name: string;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  address: string | null;
  maps_url: string | null;
  sort_order: number;
};

export type GalleryImage = {
  id: string;
  invitation_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

export type GiftAccount = {
  id: string;
  invitation_id: string;
  provider: string;
  account_number: string;
  account_name: string;
  qr_image_url: string | null;
  sort_order: number;
};

export type Wish = {
  id: string;
  invitation_id: string;
  name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
};

export type RsvpStatus = "attending" | "not_attending";

export type ExistingRsvp = {
  name: string;
  attendance_status: RsvpStatus;
  pax?: number | null;
  note?: string | null;
};

export type InvitationDetail = {
  invitation: Invitation;
  sessions: EventSession[];
  galleries: GalleryImage[];
  giftAccounts: GiftAccount[];
  wishes: Wish[];
};
