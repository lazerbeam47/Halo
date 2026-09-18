# Halo Desktop Overlay

Halo is an ambient, cursor-following desktop overlay assistant indicator. It provides real-time visual feedback for an AI agent's internal state through fluid, physics-based Framer Motion animations.

---

## Architecture & Component Relationships

The application is structured into an Electron main process that tracks the user's cursor and handles global shortcuts, and a React renderer process that drives the visual state machine and animations.

```
+-------------------------------------------------------------------------------+
|                             Electron Main Process                             |
|                   apps/desktop/electron/main.ts                               |
|  - Tracks cursor coordinates (moveHalo @ 16ms) -> positions transparent window|
|  - Listens for global hotkey (Alt+Space)                                      |
|  - Dispatches IPC event ("halo-state", state) to webContents                  |
+---------------------------------------+---------------------------------------+
                                        | IPC ("halo-state")
                                        v
+-------------------------------------------------------------------------------+
|                             Electron Preload Bridge                           |
|                   apps/desktop/electron/preload.cts                           |
|  - Bridges IPC via contextBridge.exposeInMainWorld("halo", ...)              |
|  - Exposes window.halo.onStateChange(callback) listener to renderer           |
+---------------------------------------+---------------------------------------+
                                        | window.halo.onStateChange
                                        v
+-------------------------------------------------------------------------------+
|                            React Renderer Layer                               |
|                                                                               |
|   apps/desktop/src/types.d.ts                                                 |
|     └── Provides Window.halo typings and Vite environment definitions         |
|                                                                               |
|   apps/desktop/src/state/haloState.ts                                         |
|     ├── Defines HaloState union & validation rules (canTransition)            |
|     ├── Maps HaloState -> HaloVisualConfig (keyframes, timing, colors)        |
|     └── Exposes HaloStateMachine store & transition helpers                   |
|                                                                               |
|   apps/desktop/src/components/Halo.tsx                                        |
|     ├── Subscribes to window.halo.onStateChange                               |
|     ├── Queries getHaloVisualConfig(state)                                    |
|     └── Feeds config.animate & config.transition into <motion.div>            |
+-------------------------------------------------------------------------------+
```

### Data Flow

1. **System & Shortcut Layer**:
   * [`main.ts`](apps/desktop/electron/main.ts) tracks cursor position via `screen.getCursorScreenPoint()` every 16ms and centers the transparent, frameless window right above the pointer (`cursor.x - 50`, `cursor.y - 55`).
   * When `Alt+Space` is pressed, Electron toggles between `listening` and `idle`, sending `"halo-state"` via IPC to the renderer.
2. **Context Isolation & Preload**:
   * [`preload.cts`](apps/desktop/electron/preload.cts) securely exposes `window.halo.onStateChange` in the main world.
3. **State Machine & Configurations**:
   * [`haloState.ts`](apps/desktop/src/state/haloState.ts) serves as the single source of truth for allowed states, valid lifecycle transitions, and visual animation definitions.
4. **Presentation & Animation**:
   * [`Halo.tsx`](apps/desktop/src/components/Halo.tsx) receives state updates (or controlled props) and translates them into smooth Framer Motion keyframe animations.

---

## Halo States & Visual Configurations

The system defines 7 distinct states representing the lifecycle of an interactive AI assistant:

| State | Role & Meaning | Accent Color | Animation Personality | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **`idle`** | Halo is at rest, waiting for user input. | White (`rgba(255,255,255,0.9)`) | Soft, subtle breathing pulse (`scale: [1, 1.04, 1]`) | `2.0s` |
| **`listening`** | Actively capturing user speech or prompt. | Sky Blue (`rgba(120,180,255,0.9)`) | Alert, responsive expansion (`scale: [1, 1.15, 1]`) | `1.0s` |
| **`thinking`** | Processing, planning, or querying LLM. | Violet (`#c084fc`) | Undulating rhythmic shimmer (`scale: [1, 1.09, 0.98, 1.06, 1]`) | `1.6s` |
| **`guiding`** | Wayfinding, directing focus on screen. | Amber Gold (`#fbbf24`) | Luminous beacon pulse (`scale: [1, 1.12, 1.03, 1.08, 1]`) | `1.4s` |
| **`acting`** | Executing commands or browser actions. | Electric Cyan (`#38bdf8`) | High-tempo energetic pulse (`scale: [1, 1.18, 0.97, 1.13, 1]`) | `0.8s` |
| **`success`** | Command completed successfully. | Emerald Green (`#4ade80`) | Expansive celebratory bloom (`scale: [1, 1.22, 1.04, 1]`) | `1.2s` |
| **`error`** | Command failed or alert triggered. | Coral Red (`#f87171`) | Alert pulse with horizontal micro-jitter (`x: [0, -3, 3, -2, 2, 0]`) | `0.85s` |

---

## State Machine Transition Rules

The state transitions are formally defined in `HALO_TRANSITIONS`:

```
          +-------------------------------+
          |             idle              |
          +---------------+---------------+
            |           ^   ^           ^
            v           |   |           |
      +-----------+     |   |           |
      | listening |-----+   |           |
      +-----+-----+         |           |
            |               |           |
            v               |           |
      +-----------+         |           |
      | thinking  |---------+           |
      +-----+-----+                     |
        |   |                           |
        |   +-------------------+       |
        v                       v       |
  +-----------+           +-----------+ |
  |  guiding  | <-------> |  acting   | |
  +-----+-----+           +-----+-----+ |
        |                       |       |
        +-----------+-----------+       |
                    |                   |
            +-------+-------+           |
            v               v           |
      +-----------+   +-----------+     |
      |  success  |   |   error   |-----+
      +-----+-----+   +-----------+
            |               ^
            +---------------+
```

* **`canTransition(from, to)`**: Validates if a proposed state transition is permissible.
* **`transitionHaloState(current, next, force?)`**: Safe transition helper that preserves current state and warns on invalid transitions.
* **`HaloStateMachine`**: A class instance managing state, subscribers (`subscribe`), and transitions. Includes a shared singleton instance `haloStateMachine`.

---

## Component API (`Halo.tsx`)

The `Halo` component can be used in both **uncontrolled** (default) and **controlled** modes:

### Uncontrolled (Driven by Electron IPC or State Machine)

```tsx
import Halo from "./components/Halo";

export default function App() {
  // Automatically listens to window.halo.onStateChange
  return <Halo />;
}
```

### Controlled (Driven by Parent Component / Storybook / Debug UI)

```tsx
import Halo from "./components/Halo";

export default function CustomView() {
  return (
    <Halo
      state="thinking"
      onStateChange={(next) => console.log("Halo transitioned to:", next)}
      className="custom-halo-class"
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `state` | `HaloState` | `undefined` | Optional controlled state. When omitted, internal state managed via Electron IPC is used. |
| `onStateChange` | `(state: HaloState) => void` | `undefined` | Callback invoked when the state changes. |
| `className` | `string` | `""` | Optional CSS class name passed to the motion container. |
| `style` | `React.CSSProperties` | `undefined` | Optional style overrides applied on top of the state visual style. |

---

## Development Scripts

```bash
# Start both Vite renderer and Electron concurrently
npm run dev

# Start Vite renderer standalone (useful for browser styling)
npm run dev:renderer

# Build Electron main and preload scripts
npm run build:electron

# Build entire production bundle (renderer + electron)
npm run build

# Start Electron pointing to built output
npm start
```
