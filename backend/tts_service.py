import asyncio
import os
import tempfile

# pyttsx3 uses Windows SAPI — offline, no API key, no network
import pyttsx3


def _generate_sync(text: str, speaker: str) -> bytes:
    engine = pyttsx3.init()
    engine.setProperty('rate', 165)
    engine.setProperty('volume', 1.0)

    # Pick voice by gender
    voices = engine.getProperty('voices')
    if speaker == 'sophia':
        # Female voice (Microsoft Zira or any female)
        for v in voices:
            if any(name in v.name.lower() for name in ('zira', 'female', 'hazel', 'susan')):
                engine.setProperty('voice', v.id)
                break
    else:
        # Male voice (Microsoft David or any male)
        for v in voices:
            if any(name in v.name.lower() for name in ('david', 'male', 'mark', 'richard')):
                engine.setProperty('voice', v.id)
                break

    fd, tmpfile = tempfile.mkstemp(suffix='.wav')
    os.close(fd)

    engine.save_to_file(text, tmpfile)
    engine.runAndWait()

    with open(tmpfile, 'rb') as f:
        audio_bytes = f.read()
    os.unlink(tmpfile)
    return audio_bytes


async def generate_speech(text: str, speaker: str = 'sophia') -> bytes:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _generate_sync, text, speaker)
