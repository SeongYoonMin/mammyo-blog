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

  return <PostForm post={{ ...post, tags: post.tags.map((t) => t.name) }} />;
}
