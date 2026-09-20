

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
    async stop():Promise<Blob | null>{
        if(this.mediaRecorder?.state==="inactive"){
            console.warn("VoiceInput is not recording.");
            return null;
        }

        return new Promise((resolve)=>{
            const recorder = this.mediaRecorder!;
             recorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { // Create a Blob from the recorded audio chunks
          type: recorder.mimeType || "audio/webm",
        });

        console.log(
          `VOICE → recording stopped (${audioBlob.size} bytes)`
        );

        this.mediaStream?.getTracks().forEach((track) => track.stop()); // Stop all tracks in the media stream which releases the microphone/stops the microphone access

        this.mediaStream = null; // Clear the media stream reference
        this.mediaRecorder = null; // Clear the media recorder reference
        this.audioChunks = []; // Clear the audio chunks

        resolve(audioBlob); // Resolve the promise with the recorded audio Blob
      }; 

      recorder.stop(); // Stop the recording which triggers the onstop event and finalizes the audio data
    });
}
}