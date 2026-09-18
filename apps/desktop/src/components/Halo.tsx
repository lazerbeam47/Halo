import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  type HaloState,
  getHaloVisualConfig,
  isHaloState,
  DEFAULT_HALO_STATE,
} from "../state/haloState";

export interface HaloProps {
  /** Optional controlled state to override internal state */
  state?: HaloState;
  /** Callback invoked whenever the Halo state transitions */
  onStateChange?: (state: HaloState) => void;
  /** Optional custom CSS classes */
  className?: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

export default function Halo({
  state: controlledState,
  onStateChange,
  className = "",
  style: customStyle,
}: HaloProps = {}) {
  const [internalState, setInternalState] = useState<HaloState>(DEFAULT_HALO_STATE);

  // Use controlled state if provided, otherwise internal state
  const currentState: HaloState = controlledState ?? internalState;

  useEffect(() => {
    // Gracefully handle browser/dev environments where Electron preload is not present
    if (typeof window === "undefined" || !window.halo?.onStateChange) {
      return;
    }

    const cleanup = window.halo.onStateChange((newState) => {
      if (isHaloState(newState)) {
        if (!controlledState) {
          setInternalState(newState);
        }
        onStateChange?.(newState);
      }
    });

    return cleanup;
  }, [controlledState, onStateChange]);

  const config = useMemo(
    () => getHaloVisualConfig(currentState),
    [currentState]
  );

  return (
    <motion.div
      className={className}
      animate={{
        x: 0,
        ...config.animate,
      }}
      transition={config.transition}
      style={{
        width: "64px",
        height: "30px",
        borderRadius: "50%",
        pointerEvents: "none",
        ...config.style,
        ...customStyle,
      }}
    />
  );
}

// Re-export type for backwards compatibility
export type { HaloState };