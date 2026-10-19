-- Feed One Initial Migration
-- Traceability: Ref §7, PRD §13.2, D1-D31

create extension if not exists pgcrypto;

-- Enumerations
create type user_role as enum ('donor', 'recipient', 'coordinator');
create type actor_role as enum ('donor', 'recipient', 'coordinator', 'system');
create type donation_unit as enum ('items', 'kg');
create type storage_category as enum ('ambient', 'chilled', 'frozen', 'hot_held');
create type safety_status as enum ('pending', 'eligible_by_rules', 'eligible_by_review', 'needs_review', 'blocked');
create type donation_status as enum (
  'listed', 'match_recommended', 'no_match', 'awaiting_confirmation',
  'confirmed', 'collected', 'delivered', 'pickup_expired', 'cancelled'
);
create type offer_status as enum ('sent', 'accepted', 'declined', 'expired', 'withdrawn');
create type record_type as enum ('seeded_demo', 'lead', 'onboarded', 'rejected', 'duplicate');
create type verification_status as enum ('unverified', 'coordinator_verified');
create type org_type as enum ('ngo', 'community_kitchen', 'shelter', 'other');
create type candidate_group as enum ('eligible', 'needs_confirmation', 'excluded');
create type discovery_status as enum ('running', 'awaiting_selection', 'fetching', 'completed', 'failed');
create type parse_status as enum ('ok', 'fetch_failed', 'too_little_content', 'extraction_failed');

-- Configuration
create table if not exists food_categories (
  code        text primary key,
  label       text not null,
  sort_order  int  not null,
  active      boolean not null default true
);

create table if not exists app_config (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

-- Organisations
create table if not exists donors (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (char_length(name) between 2 and 120),
  donor_type          text not null check (donor_type in ('restaurant', 'bakery', 'grocery', 'other')),
  contact_name        text,
  contact_phone       text,
  contact_email       text,
  verification_status verification_status not null default 'unverified',
  is_demo             boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists donor_locations (
  id           uuid primary key default gen_random_uuid(),
  donor_id     uuid not null references donors(id) on delete cascade,
  label        text not null,
  address_text text not null,
  locality     text not null,
  lat          double precision not null check (lat between -90 and 90),
  lng          double precision not null check (lng between -180 and 180),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists recipients (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 2 and 160),
  normalized_name      text not null,
  org_type             org_type not null default 'other',
  description          text,
  record_type          record_type not null,
  verification_status  verification_status not null default 'unverified',
  lat                  double precision check (lat between -90 and 90),
  lng                  double precision check (lng between -180 and 180),
  locality             text,
  address_text         text,
  service_radius_km    numeric(6,1) check (service_radius_km > 0),
  accepted_categories  text[],
  capacity_items       integer check (capacity_items > 0),
  capacity_kg          numeric(8,1) check (capacity_kg > 0),
  can_collect          boolean,
  public_opening_hours text,
  contact_name         text,
  contact_phone        text,
  contact_email        text,
  website_url          text,
  website_domain       text,
  provenance           jsonb not null default '{}'::jsonb,
  duplicate_of         uuid references recipients(id),
  is_demo              boolean not null default false,
  version              integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  check ((lat is null) = (lng is null)),
  check (record_type <> 'duplicate' or duplicate_of is not null)
);

create table if not exists recipient_collection_windows (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references recipients(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time   time not null,
  end_time     time not null,
  provenance   text not null check (provenance in
                 ('recipient_confirmed', 'coordinator_verified', 'seeded_demo')),
  created_at   timestamptz not null default now(),
  check (end_time > start_time)
);

-- Users (app_users)
create table if not exists app_users (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  role         user_role not null,
  donor_id     uuid references donors(id),
  recipient_id uuid references recipients(id),
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now(),
  check (
    (role = 'donor' and donor_id is not null and recipient_id is null) or
    (role = 'recipient' and recipient_id is not null and donor_id is null) or
    (role = 'coordinator' and donor_id is null and recipient_id is null)
  )
);

-- Donations
create table if not exists donations (
  id                  uuid primary key default gen_random_uuid(),
  donor_id            uuid not null references donors(id),
  pickup_location_id  uuid not null references donor_locations(id),
  category            text not null references food_categories(code),
  title               text not null check (char_length(title) between 3 and 80),
  description         text not null check (char_length(description) between 10 and 500),
  quantity            numeric(10,1) not null check (quantity > 0),
  unit                donation_unit not null,
  unit_label          text check (unit_label is null or char_length(unit_label) between 1 and 30),
  available_from      timestamptz not null,
  pickup_deadline     timestamptz not null,
  pickup_instructions text check (pickup_instructions is null or char_length(pickup_instructions) <= 500),
  storage_category    storage_category not null,
  packaged_sealed     boolean not null,
  prepared_at         timestamptz not null,
  use_by              timestamptz,
  allergen_notes      text check (allergen_notes is null or char_length(allergen_notes) <= 300),
  attested_at         timestamptz not null,
  safety_status       safety_status not null default 'pending',
  safety_rule_id      text,
  safety_reason       text,
  status              donation_status not null default 'listed',
  status_reason       text,
  confirmed_at        timestamptz,
  collected_at        timestamptz,
  delivered_at        timestamptz,
  expired_at          timestamptz,
  cancelled_at        timestamptz,
  version             integer not null default 0,
  is_demo             boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (pickup_deadline > available_from),
  check (unit <> 'items' or quantity = trunc(quantity)),
  check (unit <> 'items' or unit_label is not null),
  check (use_by is null or use_by > prepared_at)
);

-- Safety
create table if not exists safety_rules (
  id          text primary key,              -- 'S1'..'S8'
  position    integer not null unique,
  description text not null,
  conditions  jsonb not null,
  outcome     safety_status not null check (outcome in ('eligible_by_rules', 'needs_review', 'blocked')),
  reason_text text not null,
  active      boolean not null default true
);

create table if not exists safety_reviews (
  id          uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donations(id) on delete cascade,
  reviewer_id uuid not null references app_users(id),
  decision    safety_status not null check (decision in ('eligible_by_review', 'blocked')),
  note        text not null check (char_length(note) between 3 and 500),
  created_at  timestamptz not null default now()
);

-- Matching
create table if not exists match_runs (
  id                        uuid primary key default gen_random_uuid(),
  donation_id               uuid not null references donations(id) on delete cascade,
  trigger                   text not null check (trigger in ('submit', 'edit', 'offer_declined',
                              'offer_expired', 'offer_withdrawn', 'manual', 'safety_review',
                              'accepted_offer_withdrawn')),
  evaluated_at              timestamptz not null,
  config_snapshot           jsonb not null,
  donation_blockers         text[] not null default '{}',
  outcome                   text not null check (outcome in ('match_recommended', 'no_match')),
  eligible_count            integer not null,
  needs_confirmation_count  integer not null,
  excluded_count            integer not null,
  duration_ms               integer,
  superseded_at             timestamptz,
  created_by                uuid references app_users(id)
);

create table if not exists match_candidates (
  id                       uuid primary key default gen_random_uuid(),
  match_run_id             uuid not null references match_runs(id) on delete cascade,
  recipient_id             uuid not null references recipients(id),
  candidate_group          candidate_group not null,
  rank                     integer check (rank is null or rank > 0),
  constraints              jsonb not null,
  unknowns                 jsonb not null default '[]'::jsonb,
  ranking_reasons          text[] not null default '{}',
  distance_km              numeric(8,2),
  earliest_feasible_pickup timestamptz,
  feasible_slots           jsonb not null default '[]'::jsonb,
  leftover_capacity        numeric(10,1),
  explanation              text not null,
  explanation_llm          text,
  unique (match_run_id, recipient_id),
  check ((candidate_group = 'excluded') = (rank is null))
);

-- Offers
create table if not exists offers (
  id                    uuid primary key default gen_random_uuid(),
  donation_id           uuid not null references donations(id) on delete cascade,
  recipient_id          uuid not null references recipients(id),
  match_candidate_id    uuid not null references match_candidates(id),
  status                offer_status not null default 'sent',
  sent_at               timestamptz not null default now(),
  respond_by            timestamptz not null,
  responded_at          timestamptz,
  planned_pickup_at     timestamptz,
  decline_reason        text check (decline_reason is null or decline_reason in
                          ('no_capacity', 'cannot_collect_in_time', 'food_type_not_suitable', 'other')),
  decline_note          text,
  withdrawn_reason      text,
  acknowledged_unknowns boolean not null default false,
  created_by            uuid references app_users(id),
  version               integer not null default 0,
  check (respond_by > sent_at),
  check (status <> 'accepted' or planned_pickup_at is not null)
);

-- D22: Enforce strictly one pending offer and strictly one accepted offer per donation
create unique index if not exists offers_one_sent_per_donation on offers (donation_id) where status = 'sent';
create unique index if not exists offers_one_accepted_per_donation on offers (donation_id) where status = 'accepted';

-- Lifecycle events (append-only)
create table if not exists lifecycle_events (
  id          bigint generated always as identity primary key,
  donation_id uuid not null references donations(id) on delete cascade,
  offer_id    uuid references offers(id),
  event_type  text not null check (event_type in ('donation_created', 'safety_screened',
                'safety_reviewed', 'match_run', 'offer_sent', 'offer_accepted', 'offer_declined',
                'offer_expired', 'offer_withdrawn', 'collected', 'delivered', 'pickup_expired',
                'cancelled', 'edited', 'refused_at_handoff', 'correction')),
  from_status donation_status,
  to_status   donation_status,
  actor_role  actor_role not null,
  actor_id    uuid references app_users(id),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  reason      text,
  metadata    jsonb not null default '{}'::jsonb,
  is_demo     boolean not null default false
);

-- Append-only trigger
create or replace function forbid_event_mutation() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' and current_setting('feedone.allow_event_purge', true) = 'on' then
    return old;
  end if;
  raise exception 'lifecycle_events is append-only';
end;
$$;

drop trigger if exists lifecycle_events_no_update on lifecycle_events;
create trigger lifecycle_events_no_update before update or delete on lifecycle_events
  for each row execute function forbid_event_mutation();

-- Discovery and provenance
create table if not exists discovery_runs (
  id             uuid primary key default gen_random_uuid(),
  provider       text not null check (provider in ('tinyfish', 'mock')),
  query          text not null check (char_length(query) between 3 and 200),
  location       text,
  purpose        text,
  status         discovery_status not null default 'running',
  search_results jsonb not null default '[]'::jsonb,
  selected_urls  text[] not null default '{}',
  counts         jsonb not null default '{}'::jsonb,
  error_code     text,
  error_detail   text,
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  created_by     uuid references app_users(id),
  is_demo        boolean not null default false
);

create table if not exists source_records (
  id                uuid primary key default gen_random_uuid(),
  discovery_run_id  uuid references discovery_runs(id),
  recipient_id      uuid references recipients(id),
  provider          text not null check (provider in ('tinyfish', 'mock', 'manual')),
  source_type       text not null check (source_type in ('official_website', 'search_result', 'user_provided')),
  source_url        text not null,
  final_url         text,
  title             text,
  retrieved_at      timestamptz not null,
  content_hash      text,
  excerpt           text check (excerpt is null or char_length(excerpt) <= 2000),
  extracted         jsonb not null default '{}'::jsonb,
  extraction_method text check (extraction_method is null or extraction_method in ('deterministic', 'llm')),
  parse_status      parse_status not null,
  error             text,
  simulated         boolean not null default false,
  created_at        timestamptz not null default now()
);

-- Notifications and audit
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references app_users(id),
  actor_role  actor_role not null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists donations_status_deadline on donations (status, pickup_deadline);
create index if not exists donations_donor_created on donations (donor_id, created_at desc);
create index if not exists offers_recipient_status on offers (recipient_id, status);
create index if not exists offers_status_respond_by on offers (status, respond_by);
create index if not exists match_runs_donation on match_runs (donation_id, evaluated_at desc);
create index if not exists match_candidates_run_group_rank on match_candidates (match_run_id, candidate_group, rank);
create index if not exists lifecycle_events_donation on lifecycle_events (donation_id, occurred_at);
create index if not exists notifications_user_unread on notifications (user_id, read_at);
create index if not exists recipients_record_type on recipients (record_type);
create index if not exists recipients_domain on recipients (website_domain);
create index if not exists recipients_normalized_name on recipients (normalized_name);
create index if not exists source_records_recipient on source_records (recipient_id, retrieved_at desc);
