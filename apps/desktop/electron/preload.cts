// import { contextBridge, ipcRenderer } from "electron"; // Import the ContextBridge(it is used for exposing APIs to the renderer process) and ipcRenderer (it is used for inter-process communication between the main and renderer processes) modules from Electron

// contextBridge.exposeInMainWorld("halo",{// Expose an API named "halo" in the renderer process's global window object
//     onCursorMove:(callback:(position:{x:number;y:number})=>void)=>{ // Define a method named "onCursorMove" that takes a callback function as an argument
//         const listener=(
//             _event:Electron.IpcRendererEvent,
//             position:{x:number;y:number}
//         )=>{
//             callback(position)
//         };
//         ipcRenderer.on("cursor-position", listener); // Register the listener function to listen for the "cursor-position" event from the main process and call the provided callback with the cursor position
//         return()=>{
//             ipcRenderer.removeListener("cursor-position",listener);
//         };
//     },

// });
import { contextBridge, ipcRenderer } from "electron";

console.log("PRELOAD → loaded");

contextBridge.exposeInMainWorld("halo", {
  onStateChange: (callback: (state: string) => void) => {
    console.log("PRELOAD → onStateChange registered");

    const listener = (
      _event: Electron.IpcRendererEvent,
      state: string
    ) => {
      console.log("PRELOAD → received state:", state);
      try {
        callback(state);
      } catch (err) {
        console.error("PRELOAD → error calling callback:", err);
      }
    };

    ipcRenderer.on("halo-state", listener);

    return () => {
      console.log("PRELOAD → onStateChange cleanup called");
      ipcRenderer.removeListener("halo-state", listener);
    };
  },
});