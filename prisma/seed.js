require("dotenv").config();
const { PrismaClient } = require("../generated/prisma-client/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Seed for this user ID
const USER_ID = 1;

const PLATFORMS = ["Uber", "Ola", "Rapido", "InDrive"];
const PLATFORM_WEIGHTS = [38, 28, 22, 12]; // percentage distribution

const ROUTES = [
  { pickup: "Koramangala", dropoff: "MG Road" },
  { pickup: "Indiranagar", dropoff: "Whitefield" },
  { pickup: "HSR Layout", dropoff: "Electronic City" },
  { pickup: "Marathahalli", dropoff: "Silk Board" },
  { pickup: "BTM Layout", dropoff: "Jayanagar" },
  { pickup: "JP Nagar", dropoff: "Bannerghatta Road" },
  { pickup: "Yelahanka", dropoff: "Airport" },
  { pickup: "Hebbal", dropoff: "Koramangala" },
  { pickup: "Bellandur", dropoff: "HSR Layout" },
  { pickup: "Domlur", dropoff: "Indiranagar" },
  { pickup: "Kadugodi", dropoff: "Whitefield" },
  { pickup: "Nagawara", dropoff: "Manyata Tech Park" },
  { pickup: "Rajajinagar", dropoff: "Malleshwaram" },
  { pickup: "Vijayanagar", dropoff: "Majestic" },
  { pickup: "Electronic City", dropoff: "Hosur Road" },
  { pickup: "Sarjapur", dropoff: "Marathahalli" },
  { pickup: "Banashankari", dropoff: "Kanakapura Road" },
  { pickup: "Hennur", dropoff: "Kalyan Nagar" },
  { pickup: "Yeshwanthpur", dropoff: "Peenya" },
  { pickup: "Outer Ring Road", dropoff: "Bellandur" },
];

// Fare ranges per platform (realistic INR)
const FARE_RANGE = {
  Uber: { min: 80, max: 850 },
  Ola: { min: 70, max: 700 },
  Rapido: { min: 40, max: 300 },
  InDrive: { min: 90, max: 600 },
};

function pickPlatform() {
  const r = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < PLATFORMS.length; i++) {
    cumulative += PLATFORM_WEIGHTS[i];
    if (r <= cumulative) return PLATFORMS[i];
  }
  return PLATFORMS[0];
}

function pickRoute() {
  return ROUTES[Math.floor(Math.random() * ROUTES.length)];
}

function randomFare(platform) {
  const { min, max } = FARE_RANGE[platform];
  const fare = min + Math.random() * (max - min);
  return Math.round(fare / 10) * 10; // round to nearest 10
}

// IST-aware date builder: returns a UTC Date that represents the given IST date+time
function istDate(year, month, day, hour = 10, minute = 0) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  // month is 1-based
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET;
  return new Date(utcMs);
}

// How many rides per day (weekday vs weekend)
function ridesOnDay(dayOfWeek) {
  // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) return Math.floor(Math.random() * 6) + 4; // 4–9
  return Math.floor(Math.random() * 5) + 2; // 2–6
}

// Whether to skip a day entirely (driver doesn't work every day)
function shouldSkipDay(dayOfWeek) {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  return Math.random() < (isWeekend ? 0.1 : 0.2); // skip 20% weekdays, 10% weekends
}

async function seed() {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1; // 1-based
  const nowDay = now.getDate();

  console.log(`\n🌱 Seeding data for user ${USER_ID}...\n`);

  const ridesToCreate = [];
  const fuelToCreate = [];

  // Generate 6 months of data ending today
  for (let monthsBack = 5; monthsBack >= 0; monthsBack--) {
    let year = nowYear;
    let month = nowMonth - monthsBack;
    if (month <= 0) { month += 12; year -= 1; }

    const daysInMonth = new Date(year, month, 0).getDate();
    const lastDay = (monthsBack === 0) ? nowDay : daysInMonth;

    console.log(`  → ${year}-${String(month).padStart(2, "0")} (days 1–${lastDay})`);

    for (let day = 1; day <= lastDay; day++) {
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();

      if (shouldSkipDay(dayOfWeek)) continue;

      const rideCount = ridesOnDay(dayOfWeek);
      // Spread rides across morning (7–11), afternoon (12–17), evening (17–22)
      const shifts = ["morning", "afternoon", "evening"];
      const shiftHours = { morning: [7, 11], afternoon: [12, 17], evening: [17, 22] };

      let currentMinute = 0;
      for (let r = 0; r < rideCount; r++) {
        const shift = shifts[Math.floor(Math.random() * shifts.length)];
        const [hMin, hMax] = shiftHours[shift];
        const hour = hMin + Math.floor(Math.random() * (hMax - hMin));
        const minute = Math.floor(Math.random() * 60);
        const platform = pickPlatform();
        const route = pickRoute();
        const fare = randomFare(platform);

        ridesToCreate.push({
          userId: USER_ID,
          pickup: route.pickup,
          dropoff: route.dropoff,
          fare,
          platform,
          createdAt: istDate(year, month, day, hour, minute),
        });
      }
    }

    // 2 fuel logs per month on random days (fuel up every ~2 weeks)
    const fuelDays = [
      Math.min(Math.floor(Math.random() * 7) + 3, lastDay),
      Math.min(Math.floor(Math.random() * 7) + 16, lastDay),
    ];
    const pricePerLiter = 100 + Math.random() * 8; // 100–108 INR/L
    for (const fd of fuelDays) {
      const liters = 30 + Math.random() * 20; // 30–50 L
      const roundedLiters = Math.round(liters * 10) / 10;
      const roundedPrice = Math.round(pricePerLiter * 100) / 100;
      fuelToCreate.push({
        userId: USER_ID,
        date: istDate(year, month, fd, 9, 0),
        liters: roundedLiters,
        pricePerLiter: roundedPrice,
        totalCost: Math.round(roundedLiters * roundedPrice * 100) / 100,
        notes: `Fuel fill-up ${String(month).padStart(2, "0")}/${year}`,
        createdAt: istDate(year, month, fd, 9, 5),
      });
    }
  }

  console.log(`\n  Total rides to insert: ${ridesToCreate.length}`);
  console.log(`  Total fuel logs to insert: ${fuelToCreate.length}`);

  // Insert in batches
  console.log("\n  Inserting rides...");
  const BATCH = 50;
  for (let i = 0; i < ridesToCreate.length; i += BATCH) {
    await prisma.ride.createMany({ data: ridesToCreate.slice(i, i + BATCH) });
    process.stdout.write(`  ${Math.min(i + BATCH, ridesToCreate.length)}/${ridesToCreate.length}\r`);
  }

  console.log("\n  Inserting fuel logs...");
  await prisma.fuelLog.createMany({ data: fuelToCreate });

  // Summary
  const totalRides = await prisma.ride.count({ where: { userId: USER_ID } });
  const totalFuel = await prisma.fuelLog.count({ where: { userId: USER_ID } });
  const earningsAgg = await prisma.ride.aggregate({ where: { userId: USER_ID }, _sum: { fare: true } });
  const totalEarnings = earningsAgg._sum.fare || 0;

  console.log(`\n✅ Done!\n`);
  console.log(`  Total rides in DB:    ${totalRides}`);
  console.log(`  Total fuel logs in DB:${totalFuel}`);
  console.log(`  Total earnings:       ₹${Math.round(totalEarnings).toLocaleString("en-IN")}`);
}

seed().catch((e) => {
  console.error("\n❌ Seed failed:", e.message);
  process.exit(1);
}).finally(() => prisma.$disconnect());
