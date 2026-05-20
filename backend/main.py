import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from tts_service import generate_speech

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class TTSRequest(BaseModel):
    # TalkingHead sends Google TTS format
    input: dict
    voice: dict = {}
    audioConfig: dict = {}


@app.post("/api/tts")
async def tts(req: TTSRequest):
    text = req.input.get("text", "").strip()
    if not text:
        return {"audioContent": "", "timepoints": []}

    speaker = req.voice.get("speaker", "sophia")
    audio_bytes = await generate_speech(text, speaker)
    audio_b64 = base64.b64encode(audio_bytes).decode()

    # Return Google TTS compatible response
    # TalkingHead will use built-in English lipsync since timepoints is empty
    return {"audioContent": audio_b64, "timepoints": []}


@app.get("/health")
async def health():
    return {"status": "ok"}
