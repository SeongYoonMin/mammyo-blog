import { notFound } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, include: { tags: true } });
  if (!post) notFound();

  // PostForm은 클라이언트 컴포넌트이므로 폼에 필요한 필드만 직렬화해 넘긴다
  return (
    <PostForm
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        coverImage: post.coverImage,
        content: post.content,
        published: post.published,
        tags: post.tags.map((t) => t.name),
      }}
    />
  );
}
