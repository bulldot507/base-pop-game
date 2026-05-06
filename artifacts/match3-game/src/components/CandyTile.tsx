import { motion } from "framer-motion";
import { Star, Sun, Zap, Diamond, Moon, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CandyConfig {
  gradient: string;
  shadow: string;
  icon: LucideIcon;
  iconColor: string;
  shimmer: string;
}

export const CANDY_CONFIGS: CandyConfig[] = [
  {
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee0979 100%)",
    shadow: "rgba(238,9,121,0.6)",
    icon: Heart,
    iconColor: "#fff",
    shimmer: "rgba(255,255,255,0.3)",
  },
  {
    gradient: "linear-gradient(135deg, #ffa500 0%, #ff6200 100%)",
    shadow: "rgba(255,98,0,0.6)",
    icon: Sun,
    iconColor: "#fff",
    shimmer: "rgba(255,255,255,0.3)",
  },
  {
    gradient: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
    shadow: "rgba(255,165,0,0.6)",
    icon: Star,
    iconColor: "#fff",
    shimmer: "rgba(255,255,255,0.35)",
  },
  {
    gradient: "linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)",
    shadow: "rgba(47,128,237,0.6)",
    icon: Diamond,
    iconColor: "#fff",
    shimmer: "rgba(255,255,255,0.3)",
  },
  {
    gradient: "linear-gradient(135deg, #43e97b 0%, #38b247 100%)",
    shadow: "rgba(56,178,71,0.6)",
    icon: Zap,
    iconColor: "#fff",
    shimmer: "rgba(255,255,255,0.3)",
  },
  {
    gradient: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
    shadow: "rgba(124,58,237,0.6)",
    icon: Moon,
    iconColor: "#fff",
    shimmer: "rgba(255,255,255,0.3)",
  },
];

interface CandyTileProps {
  type: number;
  isSelected: boolean;
  isMatched: boolean;
  isSwapping: boolean;
  row: number;
  col: number;
  tileSize: number;
  onPress: () => void;
  onSwipe: (dr: number, dc: number) => void;
}

export default function CandyTile({
  type,
  isSelected,
  isMatched,
  isSwapping,
  tileSize,
  onPress,
  onSwipe,
}: CandyTileProps) {
  const config = CANDY_CONFIGS[type] ?? CANDY_CONFIGS[0];
  const Icon = config.icon;
  const iconSize = Math.round(tileSize * 0.42);
  const padding = Math.round(tileSize * 0.1);

  const dragStart = { x: 0, y: 0 };

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const threshold = tileSize * 0.35;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      onPress();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipe(0, dx > 0 ? 1 : -1);
    } else {
      onSwipe(dy > 0 ? 1 : -1, 0);
    }
  }

  return (
    <motion.div
      style={{
        width: tileSize - padding * 2,
        height: tileSize - padding * 2,
        margin: padding,
        borderRadius: tileSize * 0.22,
        background: config.gradient,
        boxShadow: isSelected
          ? `0 0 0 3px #fff, 0 0 16px 4px ${config.shadow}, 0 4px 12px ${config.shadow}`
          : isMatched
            ? `0 0 24px 8px ${config.shadow}`
            : `0 4px 12px ${config.shadow}, inset 0 1px 1px ${config.shimmer}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        touchAction: "none",
        position: "relative",
        overflow: "hidden",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isMatched
          ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
          : isSelected
            ? { scale: 1.12 }
            : isSwapping
              ? { scale: 1.08 }
              : { scale: 1, opacity: 1 }
      }
      transition={
        isMatched
          ? { duration: 0.38, ease: "easeIn" }
          : isSelected || isSwapping
            ? { duration: 0.15, ease: "easeOut" }
            : { type: "spring", stiffness: 380, damping: 28 }
      }
      layout
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      whileTap={{ scale: isMatched ? 0 : 0.92 }}
    >
      {/* Shine overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          borderRadius: `${tileSize * 0.22}px ${tileSize * 0.22}px 50% 50%`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      />
      <Icon
        size={iconSize}
        color={config.iconColor}
        strokeWidth={2}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))", position: "relative", zIndex: 1 }}
      />
    </motion.div>
  );
}
