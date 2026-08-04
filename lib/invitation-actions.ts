"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase-server";

export type FormResult = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialError: FormResult = {
  status: "error",
  message: "Data belum lengkap. Coba cek kembali formnya.",
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitRsvp(
  _prevState: FormResult,
  formData: FormData
): Promise<FormResult> {
  const invitationId = readText(formData, "invitationId");
  const slug = readText(formData, "slug");
  const name = readText(formData, "name");
  const guestName = readText(formData, "guestName");
  const attendanceStatus = readText(formData, "attendanceStatus");
  const paxValue = Number(readText(formData, "pax") || "1");
  const note = readText(formData, "note");

  if (!invitationId || !slug || name.length < 2 || !attendanceStatus) {
    return initialError;
  }

  if (!["attending", "not_attending"].includes(attendanceStatus)) {
    return initialError;
  }

  if (guestName && name !== guestName) {
    return {
      status: "error",
      message: "Gunakan nama yang tertera pada link undangan.",
    };
  }

  const pax = attendanceStatus === "not_attending"
    ? 0
    : Number.isFinite(paxValue) ? Math.max(1, Math.min(paxValue, 10)) : 1;

  if (guestName) {
    const { data: existingRsvp, error: lookupError } = await supabase
      .from("rsvps")
      .select("id")
      .eq("invitation_id", invitationId)
      .eq("name", guestName)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      return { status: "error", message: "RSVP belum dapat diperiksa. Silakan coba lagi." };
    }

    if (existingRsvp) {
      const { error: updateError } = await supabase
        .from("rsvps")
        .update({
          name,
          attendance_status: attendanceStatus,
          pax,
          note: note || null,
        })
        .eq("id", existingRsvp.id);

      if (updateError) {
        return { status: "error", message: "Gagal memperbarui RSVP. Silakan coba lagi." };
      }

      revalidatePath(`/u/${slug}`);
      return {
        status: "success",
        message: "Terima kasih. Konfirmasi kehadiran Anda berhasil diperbarui.",
      };
    }
  }

  const { error } = await supabase.from("rsvps").insert({
    invitation_id: invitationId,
    name,
    attendance_status: attendanceStatus,
    pax,
    note: note || null,
  });

  if (error) {
    return {
      status: "error",
      message: "RSVP belum berhasil terkirim. Silakan coba lagi.",
    };
  }

  revalidatePath(`/u/${slug}`);

  return {
    status: "success",
    message: "Terima kasih. Konfirmasi kehadiran Anda sudah tersimpan.",
  };
}

export async function submitWish(
  _prevState: FormResult,
  formData: FormData
): Promise<FormResult> {
  const invitationId = readText(formData, "invitationId");
  const slug = readText(formData, "slug");
  const name = readText(formData, "name");
  const message = readText(formData, "message");

  if (!invitationId || !slug || name.length < 2 || message.length < 5) {
    return initialError;
  }

  const { error } = await supabase.from("wishes").insert({
    invitation_id: invitationId,
    name,
    message: message.slice(0, 500),
    is_approved: true,
  });

  if (error) {
    return {
      status: "error",
      message: "Ucapan belum berhasil terkirim. Silakan coba lagi.",
    };
  }

  revalidatePath(`/u/${slug}`);

  return {
    status: "success",
    message: "Ucapan Anda sudah terkirim. Terima kasih untuk doanya.",
  };
}
