// export {};

// declare global{ // Extend the global scope
//     interface Window{// Extend the Window interface
//         halo:{ // Define a property named "halo" on the Window interface
//             onCursorMove:( // Define a method named "onCursorMove" that takes a callback function as an argument
//                 callback:(position:{x:number;y:number})=>void // The callback function takes an object with x and y properties (representing the cursor position) and returns void
//             )=>()=>void; // The onCursorMove method returns a function that can be called to remove the event listener for cursor movement
//         }
//     }
/// <reference types="vite/client" />

import type { HaloState } from "./state/haloState";

declare global {
  interface Window {
    halo?: {
      onStateChange: (
        callback: (state: HaloState | string) => void
      ) => () => void;
    };
  }
}

export {};