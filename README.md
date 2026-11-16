# My Dev Blog

Next.js 16 (App Router, Cache Components) + Postgres(Prisma 7) 개인 블로그. 글은 DB에 저장하고 `/admin`에서 작성합니다.

## 렌더링·캐싱 전략

| 경로 | 방식 | 캐시 수명 (`cacheLife`) | 무효화 |
| --- | --- | --- | --- |
| `/about` | SSG | 영구 | 배포 시 |
| `/` | SSG + ISR | `hours` (1h 재검증) | 글 저장 시 `updateTag('posts')` |
| `/posts/[slug]` | 최근 20개 SSG, 나머지 첫 요청 시 ISR | `days` | `updateTag('post:<slug>')` |
| `/tags`, `/tags/[tag]` | SSG + ISR | `days` | `updateTag('posts')` |
| `/sitemap.xml`, `/feed.xml` | 정적 생성 + ISR | `hours` | `updateTag('posts')` |
| `/admin/**` | SSR (요청마다, 캐시 없음) | — | — |

- 데이터 캐싱은 `src/lib/posts.ts`의 `"use cache"` 함수에 모여 있습니다.
- 공개 페이지는 `export const ensureStatic = "navigation"`으로 **정적 출력이 강제**됩니다(빌드 시 검증). 빌드에 없던 글은 첫 요청 때 완성된 HTML을 만들어 응답(= blocking ISR)하므로 크롤러도 전체 본문을 받고, 없는 글은 실제 404를 반환합니다.
- 관리자 Server Action(`src/app/admin/actions.ts`)이 저장·삭제 후 `updateTag`로 즉시 무효화합니다. `cacheLife`는 무효화가 누락됐을 때의 안전망입니다.

## SEO

- 페이지별 `title`/`description`/canonical, 글은 OpenGraph `article` 메타 + JSON-LD `BlogPosting`
- `sitemap.xml`, `robots.txt`(`/admin` 차단), RSS `feed.xml`, `/admin`은 `noindex`

## 로컬 실행

```bash
npm install
cp .env.example .env    # 값 수정 (아래 로컬 DB를 쓰면 DATABASE_URL은 prisma dev가 출력한 postgres:// URL)
npm run db:dev          # 별도 터미널: 로컬 Postgres (Prisma dev, PGlite 기반)
npx prisma migrate dev
npm run db:seed         # 샘플 글 3개
npm run dev             # http://localhost:3000, 관리자: /admin
```

> `prisma dev`(PGlite)는 동시 연결이 많으면 연결이 끊길 수 있습니다. 문제가 되면 Docker Postgres나 Neon 개발 브랜치를 `DATABASE_URL`로 쓰세요.

## Vercel 배포

1. Vercel 프로젝트 생성 → Storage(Marketplace)에서 **Neon Postgres** 연결 (`DATABASE_URL` 자동 설정)
2. 환경변수: `NEXT_PUBLIC_SITE_URL`(실제 도메인), `ADMIN_PASSWORD`, `SESSION_SECRET`(32자 이상 랜덤)
3. 배포 — `npm run build`가 `prisma generate → prisma migrate deploy → next build` 순으로 실행됩니다. 빌드 중 DB를 읽어 페이지를 미리 생성하므로 빌드 시점에 DB 접속이 필요합니다.
