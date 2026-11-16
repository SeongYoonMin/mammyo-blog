import { PostList } from "@/components/post-list";
import { getPublishedPosts } from "@/lib/posts";

// 홈: 빌드 때 정적 생성(SSG) → cacheLife('hours') + 'posts' 태그로 ISR
export const ensureStatic = "navigation";

export default async function HomePage() {
  const posts = await getPublishedPosts();
  return <PostList posts={posts} />;
}
