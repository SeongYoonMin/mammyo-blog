import type { MetadataRoute } from "next";
import { getPublishedPosts, getTagsWithCount } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

// 캐시된 데이터만 사용 → 정적으로 생성되고 'posts' 태그 무효화 시 갱신
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagsWithCount()]);
  const latest = posts[0]?.updatedAt;

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/tags"), lastModified: latest, changeFrequency: "weekly", priority: 0.5 },
    ...posts.map((p) => ({
      url: absoluteUrl(`/posts/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tags.map((t) => ({
      url: absoluteUrl(`/tags/${encodeURIComponent(t.name)}`),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
