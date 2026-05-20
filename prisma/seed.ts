import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { DEFAULT_SUBJECTS } from "../src/lib/subjects";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { username: "anderson" },
    update: {},
    create: {
      username: "anderson",
      passwordHash: hashSync("Adminson", 10),
      name: "Anderson",
      role: "ADMIN",
    },
  });
  console.log(`Admin: ${admin.username} (${admin.id})`);

  // Create Maxi user
  const maxi = await prisma.user.upsert({
    where: { username: "maxi" },
    update: {},
    create: {
      username: "maxi",
      passwordHash: hashSync("m_a_x_i!", 10),
      name: "Maxi",
      role: "SCHUELER",
      classCode: "9A",
    },
  });
  console.log(`Schüler: ${maxi.username} (${maxi.id})`);

  // Create invite code
  await prisma.inviteCode.upsert({
    where: { code: "9A-2026" },
    update: {},
    create: { code: "9A-2026", className: "9A" },
  });
  console.log("Einladungscode: 9A-2026");

  // Create subjects for Maxi
  const subjectCount = await prisma.subject.count({ where: { userId: maxi.id } });
  if (subjectCount === 0) {
    for (const s of DEFAULT_SUBJECTS) {
      await prisma.subject.create({
        data: { name: s.name, icon: s.icon, color: s.color, order: s.order, userId: maxi.id },
      });
    }
    console.log(`${DEFAULT_SUBJECTS.length} Fächer für Maxi angelegt.`);
  }

  // Create settings for Maxi
  const existingSettings = await prisma.settings.findUnique({ where: { userId: maxi.id } });
  if (!existingSettings) {
    await prisma.settings.create({
      data: { userId: maxi.id, decimalPlaces: 1, sortOrder: "best", theme: "light" },
    });
  }

  // Assign orphan data to Maxi
  await prisma.subject.updateMany({ where: { userId: null }, data: { userId: maxi.id } });
  await prisma.grade.updateMany({ where: { userId: null }, data: { userId: maxi.id } });
  await prisma.calendarEvent.updateMany({ where: { userId: null }, data: { userId: maxi.id } });
  await prisma.studySession.updateMany({ where: { userId: null }, data: { userId: maxi.id } });
  await prisma.flashcard.updateMany({ where: { userId: null }, data: { userId: maxi.id } });
  await prisma.savedTerm.updateMany({ where: { userId: null }, data: { userId: maxi.id } });
  console.log("Bestehende Daten Maxi zugewiesen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
