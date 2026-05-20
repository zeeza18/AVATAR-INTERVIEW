declare module '@met4citizen/talkinghead' {
  export class TalkingHead {
    audioCtx: AudioContext
    constructor(element: HTMLElement, options: Record<string, unknown>): void
    showAvatar(options: Record<string, unknown>, onProgress?: (ev: ProgressEvent) => void): Promise<void>
    speakText(text: string): Promise<void>
    speakAudio(audio: Record<string, unknown>): Promise<void>
    lookAtCamera(ms: number): void
    speakWithHands(): void
    start(): void
    stop(): void
  }
}
