-- Migration: tambah kolom bride_photo_url dan groom_photo_url ke tabel invitations
-- Jalankan di Supabase SQL Editor setelah schema.sql sudah ada

alter table public.invitations
  add column if not exists bride_photo_url text,
  add column if not exists groom_photo_url text;
