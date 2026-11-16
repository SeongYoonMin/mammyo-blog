import { PostForm } from "@/components/post-form";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

export default async function NewPostPage() {
  await requireAdmin();
  return <PostForm />;
}
