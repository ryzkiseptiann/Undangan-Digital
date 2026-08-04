-- Optional sample data for local/demo testing.
-- Run after supabase/schema.sql if you want one published invitation.

insert into public.invitations (
  slug,
  event_type,
  title,
  bride_name,
  groom_name,
  display_names,
  opening_text,
  quote,
  main_event_at,
  hero_image_url,
  bride_photo_url,
  groom_photo_url,
  music_url,
  theme,
  is_published
)
values (
  'wedding-invitation-digital',
  'wedding',
  'Pernikahan Rini & Roni',
  'Rini Gustiana Sari',
  'Roni Subagja',
  'Rini Gustiana Sari ♡ Roni Subagja',
  'Rini Gustiana Sari, putri dari Bapak Rukmana (Ache) dan Ibu Siti Maryam, bersama Roni Subagja, putra dari Bapak Syamsudin dan Ibu Euis Juati, dengan penuh rasa syukur mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu.',
  'Dua hati, satu janji, dan doa terbaik yang mengiringi langkah baru kami.',
  '2026-11-22 08:00:00+07',
  '/images/demo/hero.jpeg',
  '/images/demo/Wanita.jpeg',
  '/images/demo/Pria.jpeg',
  '/music/Bermuara.mp3',
  '{"palette":"ivory-charcoal-gold","style":"luxury-editorial"}'::jsonb,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  bride_name = excluded.bride_name,
  groom_name = excluded.groom_name,
  display_names = excluded.display_names,
  opening_text = excluded.opening_text,
  quote = excluded.quote,
  main_event_at = excluded.main_event_at,
  hero_image_url = excluded.hero_image_url,
  bride_photo_url = excluded.bride_photo_url,
  groom_photo_url = excluded.groom_photo_url,
  music_url = excluded.music_url,
  theme = excluded.theme,
  is_published = excluded.is_published;

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
delete from public.event_sessions
using invitation
where event_sessions.invitation_id = invitation.id;

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
insert into public.event_sessions (
  invitation_id,
  name,
  starts_at,
  ends_at,
  venue_name,
  address,
  maps_url,
  sort_order
)
select
  invitation.id,
  session_data.name,
  session_data.starts_at::timestamptz,
  session_data.ends_at::timestamptz,
  session_data.venue_name,
  session_data.address,
  session_data.maps_url,
  session_data.sort_order
from invitation
cross join (
  values
    (
      'Akad Nikah',
      '2026-11-22 08:00:00+07',
      null,
      'Kantor RW 09',
      'Jl. Pasir Huni Raya No. 2, RT 001/RW 009, Kel. Ancol, Kec. Regol, Kota Bandung',
      'https://www.google.com/maps/search/?api=1&query=Jl.+Pasirluyu+Timur+No.7+Ancol+Regol+Bandung',
      1
    ),
    (
      'Resepsi',
      '2026-11-22 10:00:00+07',
      '2026-11-22 16:00:00+07',
      'Kantor RW 09',
      'Jl. Pasir Huni Raya No. 2, RT 001/RW 009, Kel. Ancol, Kec. Regol, Kota Bandung',
      'https://www.google.com/maps/search/?api=1&query=Jl.+Pasirluyu+Timur+No.7+Ancol+Regol+Bandung',
      2
    )
) as session_data(name, starts_at, ends_at, venue_name, address, maps_url, sort_order);

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
delete from public.galleries
using invitation
where galleries.invitation_id = invitation.id;

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
insert into public.galleries (
  invitation_id,
  image_url,
  alt_text,
  sort_order
)
select
  invitation.id,
  gallery_data.image_url,
  gallery_data.alt_text,
  gallery_data.sort_order
from invitation
cross join (
  values
    ('/images/demo/gallery-1.jpg', 'Momen bahagia Rini dan Roni', 1),
    ('/images/demo/gallery-3.jpg', 'Langkah kecil menuju janji suci', 6),
    ('/images/demo/gallery-5.jpg', 'Senyum hangat calon pengantin', 2),
    ('/images/demo/gallery-2.jpg', 'Potret kebersamaan menjelang hari pernikahan', 4),
    ('/images/demo/gallery-6.jpg', 'Kenangan indah bersama pasangan', 5),
    ('/images/demo/gallery-4.jpg', 'Cerita cinta yang ingin kami bagikan', 3)
) as gallery_data(image_url, alt_text, sort_order);

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
delete from public.gift_accounts
using invitation
where gift_accounts.invitation_id = invitation.id;

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
insert into public.gift_accounts (
  invitation_id,
  provider,
  account_number,
  account_name,
  sort_order
)
select
  invitation.id,
  gift_data.provider,
  gift_data.account_number,
  gift_data.account_name,
  gift_data.sort_order
from invitation
cross join (
  values
    ('Bank Mandiri', '1300028130048', 'RINI GUSTIANA SARI', 1),
    ('BNI', '1946895318', 'RONI SUBAGJA', 2)
) as gift_data(provider, account_number, account_name, sort_order);

with invitation as (
  select id from public.invitations where slug = 'wedding-invitation-digital'
)
insert into public.wishes (
  invitation_id,
  name,
  message,
  is_approved
)
select
  invitation.id,
  'Keluarga Besar',
  'Selamat menempuh hidup baru. Semoga rumah tangga Rini dan Roni selalu diberkahi, dipenuhi kasih sayang, dan menjadi keluarga yang sakinah, mawaddah, warahmah.',
  true
from invitation
where not exists (
  select 1
  from public.wishes
  where wishes.invitation_id = invitation.id
);
