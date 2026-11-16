"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

// 첫 로드는 애니메이션 없이 바로 보여 주고(LCP·SEO), 이후 클라이언트 이동에서만 등장 애니메이션을 쓴다.
let hasHydrated = false;
function useAnimateIn() {
  const [animate] = useState(() => hasHydrated);
  useEffect(() => {
    hasHydrated = true;
  }, []);
  return animate;
}

/** 페이지 전환: 아래에서 살짝 올라오며 나타남 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const animateIn = useAnimateIn();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={animateIn ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

const grid: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

/** 카드 그리드: 카드가 차례로 나타남 */
export function CardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const animateIn = useAnimateIn();
  return (
    <motion.ul className={className} variants={grid} initial={animateIn ? "hidden" : false} animate="show">
      {children}
    </motion.ul>
  );
}

/** 카드: hover 시 살짝 떠오름 */
export function CardItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.li
      className={className}
      variants={item}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.li>
  );
}
