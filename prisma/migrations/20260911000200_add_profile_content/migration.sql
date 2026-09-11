CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "name" TEXT NOT NULL,
    "heroEyebrow" TEXT NOT NULL,
    "heroLead" TEXT NOT NULL,
    "heroAccent" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "bioTitle" TEXT NOT NULL,
    "bioParagraphs" JSONB NOT NULL,
    "values" JSONB NOT NULL,
    "tools" JSONB NOT NULL,
    "experiences" JSONB NOT NULL,
    "email" TEXT NOT NULL,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "resumeUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Profile" ADD COLUMN "profileImageUrl" TEXT;
