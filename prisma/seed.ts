import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  // src/lib/db.ts와 같은 이유로 sslmode를 verify-full로 명시
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!.replace(/sslmode=require\b/, "sslmode=verify-full"),
  }),
});

const posts = [
  {
    slug: "hello-world",
    title: "블로그를 시작합니다",
    description: "Next.js와 Postgres로 만든 개인 블로그의 첫 글입니다.",
    tags: ["회고"],
    content: "## 안녕하세요\n\n이 블로그는 **Next.js 16**의 Cache Components로 SSG·ISR·SSR을 섞어서 만들었습니다.\n",
    publishedAt: new Date("2026-11-01T09:00:00+09:00"),
  },
  {
    slug: "nextjs-caching",
    title: "Next.js 16 캐싱 정리",
    description: "use cache, cacheLife, cacheTag로 ISR을 구현하는 방법.",
    tags: ["nextjs", "캐싱"],
    content:
      "## use cache\n\n```ts\nexport async function getPosts() {\n  'use cache'\n  cacheLife('hours')\n  cacheTag('posts')\n}\n```\n\n- `cacheLife` = 시간 기반 재검증\n- `updateTag` = 온디맨드 재검증\n",
    publishedAt: new Date("2026-11-08T09:00:00+09:00"),
  },
  {
    slug: "seo-checklist",
    title: "블로그 SEO 체크리스트",
    description: "메타데이터, sitemap, robots, JSON-LD까지.",
    tags: ["nextjs", "seo"],
    content: "## 체크리스트\n\n1. 페이지별 title/description\n2. canonical URL\n3. sitemap.xml, robots.txt\n4. JSON-LD `BlogPosting`\n",
    publishedAt: new Date("2026-11-12T09:00:00+09:00"),
  },
];

async function main() {
  for (const { tags, ...p } of posts) {
    const connectOrCreate = tags.map((name) => ({ where: { name }, create: { name } }));
    await db.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, published: true, tags: { connectOrCreate } },
    });
  }
  console.log(`Seeded ${posts.length} posts`);
}

main().finally(() => db.$disconnect());
