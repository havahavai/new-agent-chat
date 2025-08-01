/**
 * Advanced Animation System
 * Provides predefined animations, micro-interactions, and performance optimizations
 */

import { Variants, Transition } from "framer-motion";

// Performance-optimized transitions
export const PERFORMANCE_TRANSITIONS = {
  fast: { duration: 0.15, ease: "easeOut" },
  normal: { duration: 0.25, ease: "easeOut" },
  slow: { duration: 0.4, ease: "easeOut" },
  spring: { type: "spring", stiffness: 300, damping: 30 },
  bounce: { type: "spring", stiffness: 400, damping: 10 },
  smooth: { type: "spring", stiffness: 100, damping: 20 },
} as const;

// Predefined animation variants
export const ANIMATIONS = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.normal,
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: PERFORMANCE_TRANSITIONS.normal,
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: PERFORMANCE_TRANSITIONS.normal,
  },

  fadeInLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: PERFORMANCE_TRANSITIONS.normal,
  },

  fadeInRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: PERFORMANCE_TRANSITIONS.normal,
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  scaleInBounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: PERFORMANCE_TRANSITIONS.bounce,
  },

  // Slide animations
  slideInUp: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  slideInDown: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  slideInLeft: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  slideInRight: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: PERFORMANCE_TRANSITIONS.normal,
  },

  // Hover animations
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  hoverLift: {
    whileHover: { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
    whileTap: { y: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Focus animations
  focusRing: {
    whileFocus: {
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
      scale: 1.02,
    },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Loading animations
  pulse: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Message animations
  messageIn: {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.95 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  messageOut: {
    initial: { opacity: 1, x: 0, scale: 1 },
    animate: { opacity: 0, x: 20, scale: 0.95 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Widget animations
  widgetSlideIn: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  widgetSlideOut: {
    initial: { x: 0, opacity: 1 },
    animate: { x: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Panel animations
  panelSlideIn: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  // Button animations
  buttonPress: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Floating button animations
  floatingButton: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
    transition: PERFORMANCE_TRANSITIONS.bounce,
  },

  // Notification animations
  notificationSlideIn: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  // Tooltip animations
  tooltipFade: {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },
} as const;

// Micro-interactions
export const MICRO_INTERACTIONS = {
  // Typing indicator
  typingDots: {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Success checkmark
  successCheck: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: PERFORMANCE_TRANSITIONS.bounce,
  },

  // Error shake
  errorShake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  },

  // Loading spinner
  loadingSpinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Heartbeat
  heartbeat: {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Breathe
  breathe: {
    animate: {
      opacity: [0.7, 1, 0.7],
      scale: [0.98, 1, 0.98],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
} as const;

// Layout-specific animations
export const LAYOUT_ANIMATIONS = {
  // Sidebar animations
  sidebarOpen: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  sidebarClose: {
    initial: { x: 0, opacity: 1 },
    animate: { x: "-100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Widget panel animations
  widgetPanelOpen: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  widgetPanelClose: {
    initial: { x: 0, opacity: 1 },
    animate: { x: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Bottom sheet animations
  bottomSheetOpen: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  bottomSheetClose: {
    initial: { y: 0, opacity: 1 },
    animate: { y: "100%", opacity: 0 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },

  // Modal animations
  modalOpen: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: PERFORMANCE_TRANSITIONS.spring,
  },

  modalClose: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.8 },
    transition: PERFORMANCE_TRANSITIONS.fast,
  },
} as const;

// Utility functions for creating custom animations
export const createStaggerAnimation = (
  staggerDelay: number = 0.1,
  itemAnimation: Variants = ANIMATIONS.staggerItem,
): Variants => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: staggerDelay,
    },
  },
  ...itemAnimation,
});

export const createHoverAnimation = (
  scale: number = 1.05,
  lift: number = -2,
): Variants => ({
  whileHover: { scale, y: lift },
  whileTap: { scale: 0.95, y: 0 },
  transition: PERFORMANCE_TRANSITIONS.fast,
});

export const createFocusAnimation = (
  ringColor: string = "rgba(59, 130, 246, 0.5)",
  scale: number = 1.02,
): Variants => ({
  whileFocus: {
    boxShadow: `0 0 0 2px ${ringColor}`,
    scale,
  },
  transition: PERFORMANCE_TRANSITIONS.fast,
});

// Performance optimization utilities
export const optimizeAnimation = (
  animation: Variants,
  reduceMotion: boolean = false,
): Variants => {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 },
    };
  }
  return animation;
};

export const createReducedMotionAnimation = (): Variants => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.1 },
});

// Animation presets for common use cases
export const ANIMATION_PRESETS = {
  // Chat message animations
  chatMessage: {
    container: createStaggerAnimation(0.05),
    item: ANIMATIONS.messageIn,
  },

  // Widget animations
  widget: {
    open: ANIMATIONS.widgetSlideIn,
    close: ANIMATIONS.widgetSlideOut,
  },

  // Panel animations
  panel: {
    open: LAYOUT_ANIMATIONS.widgetPanelOpen,
    close: LAYOUT_ANIMATIONS.widgetPanelClose,
  },

  // Button animations
  button: {
    default: ANIMATIONS.buttonPress,
    primary: createHoverAnimation(1.05, -2),
    secondary: createHoverAnimation(1.02, -1),
  },

  // Loading animations
  loading: {
    spinner: MICRO_INTERACTIONS.loadingSpinner,
    pulse: ANIMATIONS.pulse,
    breathe: MICRO_INTERACTIONS.breathe,
  },

  // Feedback animations
  feedback: {
    success: MICRO_INTERACTIONS.successCheck,
    error: MICRO_INTERACTIONS.errorShake,
    heartbeat: MICRO_INTERACTIONS.heartbeat,
  },
} as const;

// Export types
export type AnimationName = keyof typeof ANIMATIONS;
export type MicroInteractionName = keyof typeof MICRO_INTERACTIONS;
export type LayoutAnimationName = keyof typeof LAYOUT_ANIMATIONS;
export type AnimationPresetName = keyof typeof ANIMATION_PRESETS;
