import { PrismaClient } from "@prisma/client";
import { GameGenres } from "../src/types";

const prisma = new PrismaClient();

async function main() {
  await prisma.genre.createMany({
    data: GameGenres.map((genre) => ({
      name: genre,
    })),
  });

  await prisma.platform.createMany({
    data: ["PS4", "PS5"].map((platform) => ({
      name: platform,
    })),
  });

  console.log("done!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
