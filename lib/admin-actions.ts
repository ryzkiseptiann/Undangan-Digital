"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase-server";

export type Rsvp = {
  id: string;
  name: string;
  attendance_status: "attending" | "not_attending";
  pax: number;
  note: string | null;
  created_at: string;
};

export type RsvpStats = {
  total: number;
  attending: number;
  not_attending: number;
  totalPax: number;
};

export async function getRsvps(slug: string): Promise<{ rsvps: Rsvp[]; stats: RsvpStats }> {
  await requireAdmin();
  // Get invitation ID from slug
  const { data: invitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!invitation) {
    return { rsvps: [], stats: { total: 0, attending: 0, not_attending: 0, totalPax: 0 } };
  }

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("id, name, attendance_status, pax, note, created_at")
    .eq("invitation_id", invitation.id)
    .order("created_at", { ascending: false });

  const list = (rsvps ?? []) as Rsvp[];

  const stats: RsvpStats = {
    total: list.length,
    attending: list.filter((r) => r.attendance_status === "attending").length,
    not_attending: list.filter((r) => r.attendance_status === "not_attending").length,
    totalPax: list.filter((r) => r.attendance_status === "attending").reduce((acc, r) => acc + r.pax, 0),
  };

  return { rsvps: list, stats };
}

export async function deleteRsvp(id: string, slug: string): Promise<{ success: boolean }> {
  await requireAdmin();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!invitation) return { success: false };

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("id", id)
    .eq("invitation_id", invitation.id);
  if (error) return { success: false };
  revalidatePath("/admin");
  revalidatePath(`/u/${slug}`);
  return { success: true };
}

export async function deleteAllRsvps(slug: string): Promise<{ success: boolean }> {
  await requireAdmin();
  const { data: invitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!invitation) return { success: false };

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("invitation_id", invitation.id);

  if (error) return { success: false };
  revalidatePath("/admin");
  revalidatePath(`/u/${slug}`);
  return { success: true };
}
