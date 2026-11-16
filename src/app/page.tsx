import { PageHeader, PostList, TagFilter } from "@/components/post-list";
import { getPublishedPosts, getTagsWithCount } from "@/lib/posts";
import { site } from "@/lib/site";

// 홈: 빌드 때 정적 생성(SSG) → cacheLife('hours') + 'posts' 태그로 ISR
export const ensureStatic = "navigation";

export default async function HomePage() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagsWithCount()]);
  return (
    <>
      <PageHeader title="전체 글" description={site.description} />
      <TagFilter tags={tags.map((t) => t.name)} />
      <PostList posts={posts} />
    </>
  );
}
