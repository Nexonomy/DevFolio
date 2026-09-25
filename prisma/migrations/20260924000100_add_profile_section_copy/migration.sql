ALTER TABLE "Profile"
ADD COLUMN "sectionCopy" JSONB NOT NULL DEFAULT '{}'::jsonb;
