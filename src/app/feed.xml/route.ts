import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// RSS 2.0 — 캐시된 글 목록으로 정적 생성, 'posts' 태그 무효화 시 갱신
export async function GET() {
  const posts = (await getPublishedPosts()).slice(0, 20);
  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/posts/${p.slug}`);
      return `<item><title>${escape(p.title)}</title><link>${url}</link><guid>${url}</guid><description>${escape(p.description)}</description><pubDate>${p.publishedAt.toUTCString()}</pubDate>${p.tags.map((t) => `<category>${escape(t)}</category>`).join("")}</item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(site.name)}</title><link>${site.url}</link><description>${escape(site.description)}</description><language>ko</language><atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
