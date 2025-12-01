-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subline" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "image_url" TEXT,
    "download_url" TEXT,
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);
