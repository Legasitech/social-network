/**
 * Seed sticker packs
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CDN = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64";

async function main() {
  const packs = [
    {
      id: "pack-emotions",
      name: "Эмоции",
      description: "Классические эмоции",
      isOfficial: true,
      coverUrl: `${CDN}/1f600.png`,
      stickers: [
        { imageUrl: `${CDN}/1f600.png`, emoji: "😀" },
        { imageUrl: `${CDN}/1f602.png`, emoji: "😂" },
        { imageUrl: `${CDN}/1f605.png`, emoji: "😅" },
        { imageUrl: `${CDN}/1f60d.png`, emoji: "😍" },
        { imageUrl: `${CDN}/1f618.png`, emoji: "😘" },
        { imageUrl: `${CDN}/1f62d.png`, emoji: "😭" },
        { imageUrl: `${CDN}/1f622.png`, emoji: "😢" },
        { imageUrl: `${CDN}/1f621.png`, emoji: "😡" },
        { imageUrl: `${CDN}/1f624.png`, emoji: "😤" },
        { imageUrl: `${CDN}/1f914.png`, emoji: "🤔" },
        { imageUrl: `${CDN}/1f644.png`, emoji: "🙄" },
        { imageUrl: `${CDN}/1f92f.png`, emoji: "🤯" },
        { imageUrl: `${CDN}/1f973.png`, emoji: "🥳" },
        { imageUrl: `${CDN}/1f912.png`, emoji: "🤒" },
        { imageUrl: `${CDN}/1f634.png`, emoji: "😴" },
      ],
    },
    {
      id: "pack-gestures",
      name: "Жесты",
      description: "Руки и жесты",
      isOfficial: true,
      coverUrl: `${CDN}/1f44d.png`,
      stickers: [
        { imageUrl: `${CDN}/1f44d.png`, emoji: "👍" },
        { imageUrl: `${CDN}/1f44e.png`, emoji: "👎" },
        { imageUrl: `${CDN}/1f44f.png`, emoji: "👏" },
        { imageUrl: `${CDN}/1f64f.png`, emoji: "🙏" },
        { imageUrl: `${CDN}/1f91d.png`, emoji: "🤝" },
        { imageUrl: `${CDN}/1f4aa.png`, emoji: "💪" },
        { imageUrl: `${CDN}/270c-fe0f.png`, emoji: "✌️" },
        { imageUrl: `${CDN}/1f91f.png`, emoji: "🤟" },
        { imageUrl: `${CDN}/1f44b.png`, emoji: "👋" },
        { imageUrl: `${CDN}/1f91e.png`, emoji: "🤞" },
        { imageUrl: `${CDN}/1f446.png`, emoji: "👆" },
        { imageUrl: `${CDN}/1f447.png`, emoji: "👇" },
      ],
    },
    {
      id: "pack-hearts",
      name: "Сердечки",
      description: "Любовь и сердечки",
      isOfficial: true,
      coverUrl: `${CDN}/2764-fe0f.png`,
      stickers: [
        { imageUrl: `${CDN}/2764-fe0f.png`, emoji: "❤️" },
        { imageUrl: `${CDN}/1f9e1.png`, emoji: "🧡" },
        { imageUrl: `${CDN}/1f49b.png`, emoji: "💛" },
        { imageUrl: `${CDN}/1f49a.png`, emoji: "💚" },
        { imageUrl: `${CDN}/1f499.png`, emoji: "💙" },
        { imageUrl: `${CDN}/1f49c.png`, emoji: "💜" },
        { imageUrl: `${CDN}/1f90d.png`, emoji: "🤍" },
        { imageUrl: `${CDN}/1f5a4.png`, emoji: "🖤" },
        { imageUrl: `${CDN}/1f494.png`, emoji: "💔" },
        { imageUrl: `${CDN}/1f495.png`, emoji: "💕" },
        { imageUrl: `${CDN}/1f497.png`, emoji: "💗" },
        { imageUrl: `${CDN}/1f496.png`, emoji: "💖" },
      ],
    },
    {
      id: "pack-party",
      name: "Праздник",
      description: "Огонь, тусовка, успех",
      isOfficial: true,
      coverUrl: `${CDN}/1f525.png`,
      stickers: [
        { imageUrl: `${CDN}/1f525.png`, emoji: "🔥" },
        { imageUrl: `${CDN}/1f389.png`, emoji: "🎉" },
        { imageUrl: `${CDN}/1f38a.png`, emoji: "🎊" },
        { imageUrl: `${CDN}/1f4af.png`, emoji: "💯" },
        { imageUrl: `${CDN}/2b50.png`, emoji: "⭐" },
        { imageUrl: `${CDN}/1f31f.png`, emoji: "🌟" },
        { imageUrl: `${CDN}/1f4a5.png`, emoji: "💥" },
        { imageUrl: `${CDN}/1f680.png`, emoji: "🚀" },
        { imageUrl: `${CDN}/1f3c6.png`, emoji: "🏆" },
        { imageUrl: `${CDN}/1f3af.png`, emoji: "🎯" },
        { imageUrl: `${CDN}/1f48e.png`, emoji: "💎" },
        { imageUrl: `${CDN}/1f911.png`, emoji: "🤑" },
      ],
    },
    {
      id: "pack-animals",
      name: "Животные",
      description: "Милые зверушки",
      isOfficial: true,
      coverUrl: `${CDN}/1f436.png`,
      stickers: [
        { imageUrl: `${CDN}/1f436.png`, emoji: "🐶" },
        { imageUrl: `${CDN}/1f431.png`, emoji: "🐱" },
        { imageUrl: `${CDN}/1f42d.png`, emoji: "🐭" },
        { imageUrl: `${CDN}/1f430.png`, emoji: "🐰" },
        { imageUrl: `${CDN}/1f98a.png`, emoji: "🦊" },
        { imageUrl: `${CDN}/1f43b.png`, emoji: "🐻" },
        { imageUrl: `${CDN}/1f981.png`, emoji: "🦁" },
        { imageUrl: `${CDN}/1f427.png`, emoji: "🐧" },
        { imageUrl: `${CDN}/1f99c.png`, emoji: "🦜" },
        { imageUrl: `${CDN}/1f422.png`, emoji: "🐢" },
        { imageUrl: `${CDN}/1f40d.png`, emoji: "🐍" },
        { imageUrl: `${CDN}/1f98b.png`, emoji: "🦋" },
      ],
    },
  ];

  for (const pack of packs) {
    const existing = await prisma.stickerPack.findUnique({ where: { id: pack.id } });
    if (existing) {
      console.log("~ skip (exists):", pack.name);
      continue;
    }
    await prisma.stickerPack.create({
      data: {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        isOfficial: pack.isOfficial,
        coverUrl: pack.coverUrl,
        stickers: {
          create: pack.stickers,
        },
      },
    });
    console.log("✓", pack.name, `(${pack.stickers.length} stickers)`);
  }

  console.log("\nDone! Seeded sticker packs.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
