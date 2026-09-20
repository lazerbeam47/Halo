// import {
//     app,
//     BrowserWindow,
//     globalShortcut,
//     screen,
// } from "electron";
// import path from "path";// Import the path module from Node.js to work with file and directory paths
// import {fileURLToPath} from "node:url"; // Import the fileURLToPath function from the Node.js url module to convert file URLs to file paths

// const __filename = fileURLToPath(import.meta.url); // Get the current file's path
// const __dirname = path.dirname(__filename); // Get the directory name of the current file's path
// let haloWindow: BrowserWindow | null = null; // List of all halo windows
// let cursorInterval:NodeJS.Timeout|null=null; // Variable to store the interval ID for cursor position updates

// function createHaloWindow(){ // Create a new halo window
//     const display = screen.getPrimaryDisplay(); // it means that the halo window will be created on the primary display of the user's computer. The primary display is typically the main monitor that the user interacts with, and it is where most applications and windows are displayed by default.

//     haloWindow = new BrowserWindow({ // Create a new BrowserWindow instance for the halo window
//         x: display.bounds.x, // Set the x-coordinate of the halo window to the x-coordinate of the primary display's bounds
//         y: display.bounds.y, // Set the y-coordinate of the halo window to the y-coordinate of the primary display's bounds
//         width: display.bounds.width, // Set the width of the halo window to the width of the primary display's bounds
//         height: display.bounds.height,  // Set the height of the halo window to the height of the primary display's bounds
//         frame: false, // Set the frame option to false to create a frameless window (no title bar or borders)
//         show: true, // Set the show option to true to display the halo window immediately after creation
//         transparent: true, // Set the transparent option to true to make the window background transparent
//         alwaysOnTop: true, // Set the alwaysOnTop option to true to keep the halo window on top of other windows
//         skipTaskbar: true, // Set the skipTaskbar option to true to prevent the halo window from appearing in the taskbar
//         resizable: false, // Set the resizable option to false to prevent the user from resizing the halo window
//         movable: false, // Set the movable option to false to prevent the user from moving the halo window
//         hasShadow: false, // Set the hasShadow option to false to remove the window shadow
//         webPreferences: {
//             // preload: undefined, // Enable the preload script to run before other scripts in the renderer process
//             nodeIntegration: true, // Enable Node.js integration in the renderer process
//             contextIsolation: false, // Disable context isolation to allow access to Node.js APIs in the renderer process
//         },
//     });
//     //important
//     //the overlay shouldnt block user's normal interaction
//     //with other applications

//     haloWindow.setIgnoreMouseEvents(true); // Set the halo window to ignore mouse events, allowing user interaction with underlying windows
//     haloWindow.loadURL("http://localhost:5173"); // Load the specified URL in the halo window (in this case, a local development server)
//     startCursorTracking(); // Start tracking the cursor position and sending updates to the halo window
// }

// // app.whenReady().then(()=>{
// //     createHaloWindow(); // Call the createHaloWindow function to create the halo window when the Electron app is ready

// //     const registered=globalShortcut.register("CommandOrControl+Shift+Space", () => { // Register a global keyboard shortcut (Ctrl+Shift+H) to toggle the visibility of the halo window
// //         if (haloWindow) {
// //             haloWindow.isVisible() ? haloWindow.hide() : haloWindow.show();
// //         }
// //     });
// //     console.log(
// //         registered?"Halo hotkey regisetered":"Halo hotkey registration failed"
// //     );
// // });
// function startCursorTracking(){ // Start tracking the cursor position and sending updates to the halo window
//   if(!haloWindow){ // Check if the halo window doesnt exist
//     return;
//   }
//   cursorInterval=setInterval(()=>{
//     if(!haloWindow || haloWindow.isDestroyed()){ // Check if the halo window is destroyed
//       return;
//     }
//     const cursor=screen.getCursorScreenPoint(); // Get the current cursor position on the screen
//     const display=screen.getDisplayNearestPoint(cursor); // Get the display that is nearest to the current cursor position which means that the halo window will be created on the display that is closest to the user's cursor, rather than always being created on the primary display.

//     const x=cursor.x-display.bounds.x; // Calculate the x-coordinate of the cursor relative to the display's bounds
//     const y=cursor.y-display.bounds.y; // Calculate the y-coordinate of the cursor relative to the display's bounds

//     haloWindow.webContents.send("cursor-position",{x,y}); // Send the cursor position to the halo window's renderer process via IPC (Inter-Process Communication)
//   },16); // Set the interval to 16 milliseconds (approximately 60 frames per second) for smooth cursor tracking
// }
// app.whenReady().then(() => {
//   createHaloWindow();

//   console.log("Halo is running");
// });

// app.on("will-quit",()=>{
//     globalShortcut.unregisterAll(); // Unregister all global shortcuts when the Electron app is about to quit
// })
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") { // Check if the platform is not macOS (darwin)
//     app.quit(); // Quit the Electron app if all windows are closed and the platform is not macOS
//   }
// });

import {
  app,
  BrowserWindow,
  screen,
  globalShortcut,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let haloWindow: BrowserWindow | null = null;

function createHaloWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  console.log("MAIN → preload path:", preloadPath);
  console.log("MAIN → preload exists:", fs.existsSync(preloadPath));

  haloWindow = new BrowserWindow({
    width: 100,
    height: 60,

    frame: false,
    transparent: true,
    resizable: false,

    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,

    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Detect whether Electron fails to execute the preload script.
  haloWindow.webContents.on(
    "preload-error",
    (_event, preloadPath, error) => {
      console.error("MAIN → PRELOAD ERROR");
      console.error("Path:", preloadPath);
      console.error("Error:", error);
    }
  );

  // Confirm that the renderer page has finished loading.
  haloWindow.webContents.on("did-finish-load", async () => {
    console.log("MAIN → renderer finished loading");
    try {
      const hasHalo = await haloWindow?.webContents.executeJavaScript("Boolean(window.halo)");
      console.log("MAIN → window.halo exists in renderer:", hasHalo);
      if (hasHalo) {
        const haloKeys = await haloWindow?.webContents.executeJavaScript("Object.keys(window.halo || {})");
        console.log("MAIN → window.halo keys:", haloKeys);
      }
      setTimeout(() => {
        // console.log("TEST → sending listening state to renderer");
        haloWindow?.webContents.send("halo-state", "listening");
      }, 2000);
      setTimeout(() => {
        // console.log("TEST → sending idle state to renderer");
        haloWindow?.webContents.send("halo-state", "idle");
      }, 5000);
    } catch (err) {
      console.error("MAIN → error checking window.halo:", err);
    }
  });

  haloWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log(`RENDERER CONSOLE [${level}]: ${message} (${sourceId}:${line})`);
  });

  haloWindow.setIgnoreMouseEvents(true);

  haloWindow.loadURL("http://localhost:5173");

  // Keep the Halo window positioned above the cursor.
  const moveHalo = () => {
    if (!haloWindow || haloWindow.isDestroyed()) {
      return;
    }

    const cursor = screen.getCursorScreenPoint();

    haloWindow.setPosition(
      Math.round(cursor.x - 50),
      Math.round(cursor.y - 55),
      false
    );
  };

  setInterval(moveHalo, 16);
}

app.whenReady().then(() => {
  console.log("HALO STARTED");

  createHaloWindow();

  let isListening = false;

  globalShortcut.register("Alt+Space", () => {
    isListening = !isListening;

    const state = isListening ? "listening" : "idle";

    console.log(`HALO → ${state.toUpperCase()}`);

    if (haloWindow && !haloWindow.isDestroyed()) {
      console.log(
        "MAIN → sending state to renderer:",
        state
      );

      haloWindow.webContents.send(
        "halo-state",
        state
      );
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});