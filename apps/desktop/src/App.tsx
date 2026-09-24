// import { useEffect,useState } from "react";
// import Halo from "./components/Halo";
// import { VoiceInput } from "./voice/voiceInput";
// import {type HaloState ,isHaloState,DEFAULT_HALO_STATE} from "./state/haloState";
// import { response } from "express";
// import Settings from "./components/settings/Settings";
// export default function App() {
//   const [haloState, setHaloState] = useState<HaloState>(DEFAULT_HALO_STATE);

//   useEffect(() => {
//   console.log("REACT → App mounted");
//   console.log("REACT → window.halo:", window.halo);

//   const voice = new VoiceInput();

//   if (!window.halo?.onStateChange) {
//     console.warn("REACT → Halo state bridge unavailable");
//     return;
//   }

//   console.log("REACT → registering state listener");

//   const cleanup = window.halo.onStateChange(async (state) => {
//     console.log("REACT → received state:", state);

//     if (state === "listening") {
//       console.log("REACT → starting voice input...");
//       await voice.start();
//     }

//     if (state === "idle") {
//       console.log("REACT → stopping voice input...");
//       const audioBlob = await voice.stop();
//        if (!audioBlob) {
//         console.log("VOICE → no audio recorded");
//         return;
//       }
//       const formData = new FormData(); // Create a new FormData object which will be used to send the audio data to the server because the server expects a multipart/form-data request
//       formData.append("file", audioBlob, "halo-recording.wav"); // Append the audio blob to the FormData object with the key "audio" and a filename

//       console.log("STT → sending audio to backend...");

//       const response = await fetch(
//         "http://127.0.0.1:8000/transcribe",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         throw new Error(
//           `STT request failed: ${response.status}`
//         );
//       }

//       const result = await response.json();

//       console.log("STT → transcript:", result.text);

//       const transcript = result.text;

//       console.log("INTENT->sending transcript...");

//       const intentResponse = await fetch(
//         "http://127.0.0.1:8000/intent",
//         {
//           method:"POST",
//           headers:{
//             "Content-Type":"application/json",
//           },
//           body: JSON.stringify({text:transcript}),
//         }
//       );

//       if (!intentResponse.ok) {
//         throw new Error(
//           `Intent request failed: ${intentResponse.status}`
//         );
//       }

//       const intentResult = await intentResponse.json();

//       console.log("INTENT → result:", JSON.stringify(intentResult, null, 2)); // Log the intent result in a formatted JSON string for better readability where null is replaced with 2 spaces for indentation
//     }
//   });

//   return cleanup;
// }, []);

//   <Settings />;
//   return <Halo />;
// }
import Halo from "./components/Halo";
import Settings from "./components/settings/Settings";

const params = new URLSearchParams(window.location.search);
const windowType = params.get("window");

export default function App() {
  if (windowType === "settings") {
    return <Settings />;
  }

  return <Halo />;
}