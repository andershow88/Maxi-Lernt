import { PrismaClient } from "@prisma/client";
import { DEFAULT_SUBJECTS } from "../src/lib/subjects";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.subject.count();
  if (count > 0) {
    console.log(`Bereits ${count} Fächer vorhanden — Seed übersprungen.`);
    return;
  }

  for (const s of DEFAULT_SUBJECTS) {
    await prisma.subject.create({
      data: {
        name: s.name,
        icon: s.icon,
        color: s.color,
        order: s.order,
      },
    });
  }

  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", decimalPlaces: 1, sortOrder: "best", theme: "light" },
  });

  console.log(`${DEFAULT_SUBJECTS.length} Fächer und Standardeinstellungen angelegt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
