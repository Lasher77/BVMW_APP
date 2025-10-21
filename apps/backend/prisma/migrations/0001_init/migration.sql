-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Planned', 'Confirmed', 'Completed', 'Cancelled');

CREATE TYPE "MemberType" AS ENUM ('contact', 'lead');

CREATE TYPE "RegistrationStatus" AS ENUM ('registered', 'pending', 'rejected', 'cancelled', 'attended');

CREATE TYPE "WebhookSource" AS ENUM ('salesforce_campaign', 'salesforce_attendee');

CREATE TYPE "WebhookStatus" AS ENUM ('accepted', 'failed', 'processed');

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sf_campaign_id" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "status" "EventStatus" NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "is_online" BOOLEAN NOT NULL,
    "start" TIMESTAMPTZ(6) NOT NULL,
    "end" TIMESTAMPTZ(6) NOT NULL,
    "venue_name" TEXT,
    "street" TEXT,
    "postal_code" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "doo_event_id" TEXT,
    "registration_url" TEXT,
    "header_image_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX "Event_doo_event_id_idx" ON "Event"("doo_event_id");

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT PRIMARY KEY,
    "type" "MemberType" NOT NULL,
    "name" TEXT,
    "email_hash" TEXT,
    "company" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "member_id" TEXT NOT NULL REFERENCES "Member"("id") ON DELETE CASCADE,
    "status" "RegistrationStatus" NOT NULL,
    "check_in_at" TIMESTAMPTZ(6),
    "doo_event_id" TEXT,
    "doo_attendee_id" TEXT,
    "doo_booking_id" TEXT,
    "sources" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    UNIQUE("event_id", "member_id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "source" "WebhookSource" NOT NULL,
    "idempotency_key" TEXT NOT NULL UNIQUE,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMPTZ(6),
    "status" "WebhookStatus" NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);
