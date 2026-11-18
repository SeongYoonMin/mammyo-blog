"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { CoverStory, PostCard, gridClass, pillClass } from "@/components/post-list";
import type { PostSummary } from "@/lib/posts";

const spring = { type: "spring", stiffness: 420, damping: 36 } as const;
const fade = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

/**
 * 홈 목록: 태그 필터를 페이지 이동 없이 처리해
 * - 선택 알약이 layoutId로 미끄러지듯 이동하고 (Tab pill)
 * - 카드가 layout 애니메이션으로 사라지고 재정렬된다.
 * '전체'일 때만 최신 글을 커버스토리로 따로 보여 준다.
 */
export function HomeFeed({ posts, tags }: { posts: PostSummary[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  if (posts.length === 0) return <p className="text-muted">아직 글이 없습니다.</p>;

  const [cover, ...rest] = posts;
  const showCover = active === null;
  const list = showCover ? rest : posts.filter((p) => p.tags.includes(active));

  return (
    <LayoutGroup>
      <div role="group" aria-label="태그 필터" className="mb-8 flex flex-wrap gap-1.5">
        {[null, ...tags].map((tag) => {
          const on = tag === active;
          return (
            <button
              key={tag ?? "__all"}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(tag)}
              className={`${pillClass} bg-chip ${on ? "text-chip-active-fg" : "text-muted hover:text-fg"}`}
            >
              {on && (
                <motion.span
                  layoutId="tag-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-chip-active"
                />
              )}
              <span className="relative">{tag ?? "전체"}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {showCover && (
          <motion.section key="cover" {...fade} transition={spring} className="mb-12">
            <CoverStory post={cover} />
          </motion.section>
        )}
      </AnimatePresence>

      <motion.ul layout="position" transition={spring} className={gridClass}>
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((post) => (
            <motion.li key={post.slug} layout {...fade} transition={spring}>
              <PostCard post={post} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  );
}
