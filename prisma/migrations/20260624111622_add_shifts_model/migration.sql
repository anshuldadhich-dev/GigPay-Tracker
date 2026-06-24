-- CreateTable
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "start_odometer" DOUBLE PRECISION,
    "end_odometer" DOUBLE PRECISION,
    "total_hours" DOUBLE PRECISION,
    "total_distance" DOUBLE PRECISION,
    "total_earnings" DOUBLE PRECISION,
    "fuel_cost" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "platforms" TEXT,
    "paused_at" TIMESTAMP(3),
    "total_paused_minutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "auto_ended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
