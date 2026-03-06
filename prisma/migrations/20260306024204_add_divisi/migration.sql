-- CreateTable
CREATE TABLE "Divisi" (
    "id_divisi" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Divisi_pkey" PRIMARY KEY ("id_divisi")
);
