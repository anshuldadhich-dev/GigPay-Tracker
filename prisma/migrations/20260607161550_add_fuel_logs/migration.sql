-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "price_per_liter" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
