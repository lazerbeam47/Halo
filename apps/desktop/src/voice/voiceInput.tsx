

export class VoiceInput {
    private mediaStream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks:Blob[] = [];

    async start():Promise<void>{
        if(this.mediaRecorder?.state==="recording"){
            console.warn("VoiceInput is already recording.");
            return;
        }
        try{
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Request microphone access
            console.log("Voice: microphone ready");
            this.audioChunks = [];// Reset audio chunks
            this.mediaRecorder = new MediaRecorder(this.mediaStream); // Create a new MediaRecorder instance

            this.mediaRecorder.ondataavailable = (event)=>{
                if(event.data.size>0){
                    this.audioChunks.push(event.data); // Collect audio data chunks
                }
            }
            this.mediaRecorder.start(); // Start recording
            console.log("Voice: recording started");
        }catch(error){
            console.error("Error accessing microphone:", error);
        }

    }
    async stop(): Promise<Blob | null> {
  const recorder = this.mediaRecorder;

  if (!recorder || recorder.state === "inactive") {
    console.log("VOICE → not recording");
    return null;
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, {
        type: recorder.mimeType || "audio/webm",
      });

      console.log(
        `VOICE → recording stopped (${audioBlob.size} bytes)`
      );

      this.mediaStream?.getTracks().forEach((track) => {
        track.stop();
      });

      this.mediaStream = null;
      this.mediaRecorder = null;
      this.audioChunks = [];

      resolve(audioBlob);
    };

    recorder.stop();
  });
}
}