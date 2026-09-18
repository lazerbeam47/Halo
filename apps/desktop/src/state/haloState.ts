import type { CSSProperties } from "react";
import type { TargetAndTransition, Transition } from "framer-motion";

/**
 * All valid states for the Halo agent.
 */
export type HaloState =
  | "idle"
  | "listening"
  | "thinking"
  | "guiding"
  | "acting"
  | "success"
  | "error";

/**
 * Constant list of all Halo states.
 */
export const HALO_STATES: readonly HaloState[] = [
  "idle",
  "listening",
  "thinking",
  "guiding",
  "acting",
  "success",
  "error",
] as const;

/**
 * Default starting state for Halo.
 */
export const DEFAULT_HALO_STATE: HaloState = "idle";

/**
 * Type guard to check if a value is a valid HaloState.
 */
export function isHaloState(value: unknown): value is HaloState {
  return (
    typeof value === "string" && (HALO_STATES as readonly string[]).includes(value)
  );
}

/**
 * Visual configuration for a Halo state, containing animation and styling parameters.
 */
export interface HaloVisualConfig {
  /** Human-readable label of the state */
  readonly label: string;
  /** Description of what this state represents */
  readonly description: string;
  /** Primary accent color representing the state */
  readonly color: string;
  /** Secondary glow color */
  readonly glowColor: string;
  /** Framer Motion animate target / keyframes */
  readonly animate: TargetAndTransition;
  /** Framer Motion transition options */
  readonly transition: Transition;
  /** Base CSS styles applied to the element */
  readonly style: CSSProperties;
}

/**
 * State → Visual Configuration mapping for each Halo state.
 */
export const HALO_VISUAL_CONFIGS: Record<HaloState, HaloVisualConfig> = {
  idle: {
    label: "Idle",
    description: "Halo is at rest, waiting for user input.",
    color: "rgba(255, 255, 255, 0.9)",
    glowColor: "rgba(255, 255, 255, 0.55)",
    animate: {
      scale: [1, 1.04, 1],
      opacity: [0.7, 0.9, 0.7],
      borderColor: "rgba(255, 255, 255, 0.9)",
      boxShadow: [
        "0 0 6px white, 0 0 14px rgba(255, 255, 255, 0.55), 0 0 22px rgba(255, 255, 255, 0.2)",
        "0 0 8px white, 0 0 18px rgba(255, 255, 255, 0.7), 0 0 28px rgba(255, 255, 255, 0.3)",
        "0 0 6px white, 0 0 14px rgba(255, 255, 255, 0.55), 0 0 22px rgba(255, 255, 255, 0.2)",
      ],
      x: 0,
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(255, 255, 255, 0.9)",
      boxShadow:
        "0 0 6px white, 0 0 14px rgba(255, 255, 255, 0.55), 0 0 22px rgba(255, 255, 255, 0.2)",
    },
  },

  listening: {
    label: "Listening",
    description: "Halo is actively listening to user voice or input.",
    color: "rgba(120, 180, 255, 0.9)",
    glowColor: "rgba(120, 180, 255, 0.8)",
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      borderColor: "rgba(255, 255, 255, 0.95)",
      boxShadow: [
        "0 0 8px white, 0 0 20px rgba(120, 180, 255, 0.8), 0 0 40px rgba(120, 180, 255, 0.4)",
        "0 0 12px white, 0 0 28px rgba(120, 180, 255, 1), 0 0 50px rgba(120, 180, 255, 0.6)",
        "0 0 8px white, 0 0 20px rgba(120, 180, 255, 0.8), 0 0 40px rgba(120, 180, 255, 0.4)",
      ],
      x: 0,
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(255, 255, 255, 0.9)",
      boxShadow:
        "0 0 8px white, 0 0 20px rgba(120, 180, 255, 0.8), 0 0 40px rgba(120, 180, 255, 0.4)",
    },
  },

  thinking: {
    label: "Thinking",
    description: "Halo is processing, reasoning, or querying models.",
    color: "#c084fc",
    glowColor: "rgba(168, 85, 247, 0.85)",
    animate: {
      scale: [1, 1.09, 0.98, 1.06, 1],
      opacity: [0.75, 1, 0.82, 1, 0.75],
      borderColor: [
        "rgba(216, 180, 254, 0.95)",
        "rgba(192, 132, 252, 1)",
        "rgba(216, 180, 254, 0.95)",
      ],
      boxShadow: [
        "0 0 8px #d8b4fe, 0 0 22px rgba(168, 85, 247, 0.85), 0 0 40px rgba(147, 51, 234, 0.45)",
        "0 0 12px #e9d5ff, 0 0 30px rgba(168, 85, 247, 1), 0 0 52px rgba(147, 51, 234, 0.6)",
        "0 0 8px #d8b4fe, 0 0 22px rgba(168, 85, 247, 0.85), 0 0 40px rgba(147, 51, 234, 0.45)",
      ],
      x: 0,
    },
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(216, 180, 254, 0.95)",
      boxShadow:
        "0 0 8px #d8b4fe, 0 0 22px rgba(168, 85, 247, 0.85), 0 0 40px rgba(147, 51, 234, 0.45)",
    },
  },

  guiding: {
    label: "Guiding",
    description: "Halo is pointing the way or directing user attention.",
    color: "#fbbf24",
    glowColor: "rgba(245, 158, 11, 0.85)",
    animate: {
      scale: [1, 1.12, 1.03, 1.08, 1],
      opacity: [0.8, 1, 0.85, 1, 0.8],
      borderColor: [
        "rgba(252, 211, 77, 0.95)",
        "rgba(251, 191, 36, 1)",
        "rgba(252, 211, 77, 0.95)",
      ],
      boxShadow: [
        "0 0 8px #fef08a, 0 0 22px rgba(245, 158, 11, 0.85), 0 0 42px rgba(217, 119, 6, 0.45)",
        "0 0 12px #fef9c3, 0 0 30px rgba(245, 158, 11, 1), 0 0 54px rgba(217, 119, 6, 0.6)",
        "0 0 8px #fef08a, 0 0 22px rgba(245, 158, 11, 0.85), 0 0 42px rgba(217, 119, 6, 0.45)",
      ],
      x: 0,
    },
    transition: {
      duration: 1.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(252, 211, 77, 0.95)",
      boxShadow:
        "0 0 8px #fef08a, 0 0 22px rgba(245, 158, 11, 0.85), 0 0 42px rgba(217, 119, 6, 0.45)",
    },
  },

  acting: {
    label: "Acting",
    description: "Halo is actively executing actions or screen commands.",
    color: "#38bdf8",
    glowColor: "rgba(14, 165, 233, 0.9)",
    animate: {
      scale: [1, 1.18, 0.97, 1.13, 1],
      opacity: [0.85, 1, 0.88, 1, 0.85],
      borderColor: [
        "rgba(125, 211, 252, 1)",
        "rgba(56, 189, 248, 1)",
        "rgba(125, 211, 252, 1)",
      ],
      boxShadow: [
        "0 0 10px #38bdf8, 0 0 26px rgba(14, 165, 233, 0.9), 0 0 48px rgba(2, 132, 199, 0.5)",
        "0 0 14px #bae6fd, 0 0 34px rgba(14, 165, 233, 1), 0 0 60px rgba(2, 132, 199, 0.7)",
        "0 0 10px #38bdf8, 0 0 26px rgba(14, 165, 233, 0.9), 0 0 48px rgba(2, 132, 199, 0.5)",
      ],
      x: 0,
    },
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(125, 211, 252, 1)",
      boxShadow:
        "0 0 10px #38bdf8, 0 0 26px rgba(14, 165, 233, 0.9), 0 0 48px rgba(2, 132, 199, 0.5)",
    },
  },

  success: {
    label: "Success",
    description: "Halo has successfully completed the task.",
    color: "#4ade80",
    glowColor: "rgba(34, 197, 94, 0.9)",
    animate: {
      scale: [1, 1.22, 1.04, 1],
      opacity: [0.85, 1, 0.9, 0.85],
      borderColor: [
        "rgba(134, 239, 172, 1)",
        "rgba(74, 222, 128, 1)",
        "rgba(134, 239, 172, 1)",
      ],
      boxShadow: [
        "0 0 10px #86efac, 0 0 26px rgba(34, 197, 94, 0.9), 0 0 46px rgba(22, 163, 74, 0.5)",
        "0 0 14px #bbf7d0, 0 0 34px rgba(34, 197, 94, 1), 0 0 58px rgba(22, 163, 74, 0.7)",
        "0 0 10px #86efac, 0 0 26px rgba(34, 197, 94, 0.9), 0 0 46px rgba(22, 163, 74, 0.5)",
      ],
      x: 0,
    },
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(134, 239, 172, 1)",
      boxShadow:
        "0 0 10px #86efac, 0 0 26px rgba(34, 197, 94, 0.9), 0 0 46px rgba(22, 163, 74, 0.5)",
    },
  },

  error: {
    label: "Error",
    description: "Halo encountered an error or alert condition.",
    color: "#f87171",
    glowColor: "rgba(239, 68, 68, 0.9)",
    animate: {
      scale: [1, 1.14, 0.96, 1.1, 1],
      x: [0, -3, 3, -2, 2, 0],
      opacity: [0.85, 1, 0.88, 1, 0.85],
      borderColor: [
        "rgba(252, 165, 165, 1)",
        "rgba(248, 113, 113, 1)",
        "rgba(252, 165, 165, 1)",
      ],
      boxShadow: [
        "0 0 10px #fca5a5, 0 0 26px rgba(239, 68, 68, 0.9), 0 0 45px rgba(185, 28, 28, 0.5)",
        "0 0 14px #fecaca, 0 0 34px rgba(239, 68, 68, 1), 0 0 56px rgba(185, 28, 28, 0.7)",
        "0 0 10px #fca5a5, 0 0 26px rgba(239, 68, 68, 0.9), 0 0 45px rgba(185, 28, 28, 0.5)",
      ],
    },
    transition: {
      duration: 0.85,
      repeat: Infinity,
      ease: "easeInOut",
    },
    style: {
      border: "2px solid rgba(252, 165, 165, 1)",
      boxShadow:
        "0 0 10px #fca5a5, 0 0 26px rgba(239, 68, 68, 0.9), 0 0 45px rgba(185, 28, 28, 0.5)",
    },
  },
};

/**
 * Returns the visual configuration for a given HaloState.
 * If an unknown state is passed, falls back gracefully to idle.
 */
export function getHaloVisualConfig(state: HaloState): HaloVisualConfig {
  return HALO_VISUAL_CONFIGS[state] ?? HALO_VISUAL_CONFIGS[DEFAULT_HALO_STATE];
}

/**
 * Allowed transitions mapping from current state to allowable next states.
 */
export const HALO_TRANSITIONS: Record<HaloState, readonly HaloState[]> = {
  idle: ["listening", "thinking", "guiding", "acting", "error"],
  listening: ["idle", "thinking", "acting", "error"],
  thinking: ["guiding", "acting", "success", "error", "idle"],
  guiding: ["acting", "thinking", "success", "error", "idle"],
  acting: ["thinking", "guiding", "success", "error", "idle"],
  success: ["idle", "listening", "thinking"],
  error: ["idle", "listening", "thinking"],
};

/**
 * Checks whether transitioning from `from` state to `to` state is valid.
 */
export function canTransition(from: HaloState, to: HaloState): boolean {
  return HALO_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validates and executes a transition between two states.
 */
export function transitionHaloState(
  current: HaloState,
  next: HaloState,
  force = false
): HaloState {
  if (force || canTransition(current, next)) {
    return next;
  }
  console.warn(
    `[HaloState] Invalid state transition requested: "${current}" → "${next}". Remaining in "${current}".`
  );
  return current;
}

/**
 * Listener callback for state machine changes.
 */
export type HaloStateListener = (state: HaloState, prevState: HaloState) => void;

/**
 * State machine managing Halo's lifecycle, validation, and subscribers.
 */
export class HaloStateMachine {
  private state: HaloState;
  private listeners: Set<HaloStateListener> = new Set();

  constructor(initialState: HaloState = DEFAULT_HALO_STATE) {
    this.state = initialState;
  }

  getState(): HaloState {
    return this.state;
  }

  transitionTo(nextState: HaloState, force = false): boolean {
    if (this.state === nextState) return false;
    if (!force && !canTransition(this.state, nextState)) {
      console.warn(
        `[HaloStateMachine] Invalid state transition: "${this.state}" → "${nextState}".`
      );
      return false;
    }
    const prev = this.state;
    this.state = nextState;
    this.listeners.forEach((listener) => {
      try {
        listener(nextState, prev);
      } catch (err) {
        console.error("[HaloStateMachine] Error in state listener:", err);
      }
    });
    return true;
  }

  subscribe(listener: HaloStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.transitionTo(DEFAULT_HALO_STATE, true);
  }
}

/**
 * Default global singleton instance of the state machine.
 */
export const haloStateMachine = new HaloStateMachine();
