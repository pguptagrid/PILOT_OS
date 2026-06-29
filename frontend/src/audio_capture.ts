/**
 * Audio capture — mic → PCM 16kHz mono → WebSocket.
 * pause()/resume() used to mute mic while PILOT is speaking.
 */

// Microphone
//     ↓
// MediaStream
//     ↓
// AudioContext (16kHz)
//     ↓
//  ┌───────────────┬───────────────┐
//  │               │               │
// AnalyserNode  ScriptProcessorNode
//  │               │
// Volume Meter   PCM Conversion
//  │               │
// onLevel()      onPCM()

export class AudioCapture {
  private stream:    MediaStream | null = null;       //Stores the microphone stream obtained from getUserMedia()
  private ctx:       AudioContext | null = null;          //Web Audio API context that processes audio.
  private processor: ScriptProcessorNode | null = null;   //Used to receive raw audio samples.
  private analyser:  AnalyserNode | null = null;        //Used to calculate audio levels for visualizations.
  private animFrame: number | null = null;              //Stores the animation frame ID used by the volume meter.
  private _paused = false;                             //Controls whether audio is sent or ignored.

  constructor(
    private onPCM:   (buf: ArrayBuffer) => void,
    private onLevel: (lvl: number) => void
  ) {}

  // onPCM : Receives audio chunks.
  // onLevel :Receives microphone volume.

  // main fuction that begin recordings. 
  async start() {
    if (!navigator.mediaDevices) {
      throw new Error("Microphone access is unavailable. Please ensure you are using a secure context (HTTPS or localhost) and have granted microphone permissions.");
    }
    // Read user settings dynamically from localStorage
    const suppress = localStorage.getItem("pilot_noise_suppress") !== "false";
    
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: suppress,
        noiseSuppression: suppress,
        autoGainControl:  suppress,
        sampleRate:       16000,
        channelCount:     1,
      },
    });

    this.ctx = new AudioContext({ sampleRate: 16000 });//Creates the audio processing pipeline.
    const src = this.ctx.createMediaStreamSource(this.stream);//Converts microphone stream into an audio node.

    this.analyser = this.ctx.createAnalyser();//Analyzer node measures frequency/amplitude.
    this.analyser.fftSize = 256;//fft - fast fourier transformation .  determines frequency resolution. convert time-domain to frequency domain.  fundamental concept of DSP. 
    src.connect(this.analyser);
    this._startMeter();

    // ScriptProcessor for PCM — AudioWorklet preferred but needs HTTPS
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);//(bufferSize, inputChannels, outputChannels)
    src.connect(this.processor);
    this.processor.connect(this.ctx.destination);
    this.processor.onaudioprocess = (e) => {
      if (this._paused) return;   // drop audio while PILOT is speaking
      const f32 = e.inputBuffer.getChannelData(0);   
      const i16 = new Int16Array(f32.length);//APIs expect PCM16.
      
      // Apply real-time mic gain preamplification boost multiplier
      const gain = parseFloat(localStorage.getItem("pilot_mic_gain") || "1.0");
      for (let i = 0; i < f32.length; i++)
        i16[i] = Math.max(-32768, Math.min(32767, f32[i] * gain * 32768));
      this.onPCM(i16.buffer);
    };
  }

  pause()  { this._paused = true;  }//Stops sending microphone data.
  resume() { this._paused = false; }//Starts sending audio again.

  private _startMeter() {
    const buf = new Uint8Array(this.analyser!.frequencyBinCount);
    const tick = () => {
      this.analyser!.getByteFrequencyData(buf); //represent sound energy.
      const avg = buf.slice(0, 32).reduce((a, b) => a + b, 0) / 32; //These are mostly lower frequencies.
      this.onLevel(this._paused ? 0 : Math.min(avg / 128, 1));  //normalization
      this.animFrame = requestAnimationFrame(tick);//Runs around 60 FPS.
    };
    tick();
  }
  //stops everything.
  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);//Stops the volume meter animation loop.
    this.processor?.disconnect();//Stops audio from reaching the destination/output.
    this.stream?.getTracks().forEach(t => t.stop());//Frees audio resources.
    this.ctx?.close();//Frees audio resources.
    this._paused = false;//Reset pause state
  }
}
