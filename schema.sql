-- =============================================
-- CORT CLUB DATABASE SCHEMA
-- Schema: cort (self-contained, migration-ready)
-- To migrate: pg_dump --schema=cort | psql new-project
-- =============================================

CREATE SCHEMA IF NOT EXISTS cort;

-- MEMBERS: core community record (email magnet anchor)
CREATE TABLE IF NOT EXISTS cort.members (
  member_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT,
  whatsapp_number     TEXT,
  date_of_birth       DATE,
  location            TEXT,
  postcode            TEXT,
  sport_interest      TEXT,
  player_level        TEXT,
  membership_tier     TEXT DEFAULT 'free',
  membership_status   TEXT DEFAULT 'active',
  shopify_customer_id TEXT,
  consent_marketing   BOOLEAN DEFAULT false,
  consent_whatsapp    BOOLEAN DEFAULT false,
  source              TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- MEMBERSHIPS: tier + payment tracking
CREATE TABLE IF NOT EXISTS cort.memberships (
  membership_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id              UUID NOT NULL REFERENCES cort.members(member_id) ON DELETE CASCADE,
  tier_name              TEXT NOT NULL,
  status                 TEXT DEFAULT 'active',
  start_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date           DATE,
  cancellation_date      DATE,
  price                  NUMERIC(10,2),
  payment_frequency      TEXT,
  shopify_order_id       TEXT,
  shopify_subscription_id TEXT,
  benefits_unlocked      JSONB,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS cort.events (
  event_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name        TEXT NOT NULL,
  event_type        TEXT,
  event_date        DATE,
  event_time        TIME,
  location          TEXT,
  venue_name        TEXT,
  capacity          INTEGER,
  ticket_price      NUMERIC(10,2),
  member_price      NUMERIC(10,2),
  status            TEXT DEFAULT 'upcoming',
  visibility        TEXT DEFAULT 'public',
  shopify_product_id TEXT,
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- EVENT ATTENDEES
CREATE TABLE IF NOT EXISTS cort.event_attendees (
  attendee_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id               UUID NOT NULL REFERENCES cort.events(event_id) ON DELETE CASCADE,
  member_id              UUID REFERENCES cort.members(member_id) ON DELETE SET NULL,
  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  phone                  TEXT,
  ticket_type            TEXT,
  payment_status         TEXT DEFAULT 'pending',
  check_in_status        BOOLEAN DEFAULT false,
  shopify_order_id       TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- LEAGUES
CREATE TABLE IF NOT EXISTS cort.leagues (
  league_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_name        TEXT NOT NULL,
  sport              TEXT DEFAULT 'padel',
  format             TEXT,
  location           TEXT,
  start_date         DATE,
  end_date           DATE,
  capacity           INTEGER,
  status             TEXT DEFAULT 'upcoming',
  entry_price        NUMERIC(10,2),
  member_price       NUMERIC(10,2),
  connected_cort_x_id TEXT,
  description        TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- LEAGUE ENTRIES
CREATE TABLE IF NOT EXISTS cort.league_entries (
  entry_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id        UUID NOT NULL REFERENCES cort.leagues(league_id) ON DELETE CASCADE,
  member_id        UUID REFERENCES cort.members(member_id) ON DELETE SET NULL,
  entry_type       TEXT,
  player_level     TEXT,
  payment_status   TEXT DEFAULT 'pending',
  approved_status  TEXT DEFAULT 'pending',
  shopify_order_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ENQUIRIES: all contact/interest form submissions
CREATE TABLE IF NOT EXISTS cort.enquiries (
  enquiry_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  enquiry_type  TEXT,
  message       TEXT,
  source_page   TEXT,
  sport_interest TEXT,
  player_level  TEXT,
  location      TEXT,
  status        TEXT DEFAULT 'new',
  assigned_to   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- PARTNERS
CREATE TABLE IF NOT EXISTS cort.partners (
  partner_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name     TEXT NOT NULL,
  contact_name     TEXT,
  email            TEXT,
  phone            TEXT,
  partner_type     TEXT,
  offer_description TEXT,
  affiliate_code   TEXT,
  website_url      TEXT,
  status           TEXT DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- CONTENT: CORT TV / media links
CREATE TABLE IF NOT EXISTS cort.content (
  content_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  content_type      TEXT,
  platform          TEXT,
  url               TEXT,
  related_event_id  UUID REFERENCES cort.events(event_id) ON DELETE SET NULL,
  related_league_id UUID REFERENCES cort.leagues(league_id) ON DELETE SET NULL,
  publish_date      DATE,
  status            TEXT DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION cort.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_updated_at ON cort.members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON cort.members
  FOR EACH ROW EXECUTE FUNCTION cort.set_updated_at();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_cort_members_email    ON cort.members(email);
CREATE INDEX IF NOT EXISTS idx_cort_members_tier     ON cort.members(membership_tier);
CREATE INDEX IF NOT EXISTS idx_cort_attendees_event  ON cort.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_cort_entries_league   ON cort.league_entries(league_id);
CREATE INDEX IF NOT EXISTS idx_cort_enquiries_status ON cort.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_cort_enquiries_email  ON cort.enquiries(email);
CREATE INDEX IF NOT EXISTS idx_cort_content_type     ON cort.content(content_type);
