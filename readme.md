# Avatar Interview System

An AI-powered mock interview platform where a realistic 3D avatar conducts the entire interview.  
The user speaks, the avatar listens and responds — no human in the loop.

---

## What We're Building

A browser-based interview simulator with:
- A **photorealistic 3D avatar** that speaks, lip-syncs, and shows facial expressions
- An **AI brain** (LLM) that generates interview questions, follows up, and evaluates answers
- A **voice pipeline** — user speaks into mic → Whisper transcribes → LLM responds → TTS → avatar speaks
- **Round-by-round feedback** with scores, hire signals, and a final PDF report

---

## The Core Library — TalkingHead

**Repo:** https://github.com/met4citizen/TalkingHead

This is the 3D avatar renderer that runs entirely in the browser using Three.js.  
It takes a `.glb` avatar file and a TTS audio stream, then drives real-time lip sync and facial expressions automatically.  
Zero per-minute cost. No external avatar service. Runs client-side.

### How it works

```
Backend returns text
  → TTS converts to audio
  → TalkingHead receives audio → analyzes phonemes
  → Drives 15 Oculus visemes on the avatar mouth (lip sync)
  → Drives 52 ARKit blend shapes for expressions (blinks, brows, etc.)
  → Plays Mixamo body animations on the skeleton (idle, talk gestures)
```

### Minimal integration

```js
import { TalkingHead } from 'talkinghead'

const head = new TalkingHead(document.getElementById('avatar'), {
  ttsEndpoint: '/api/tts',
  cameraView: 'upper',
})

await head.showAvatar({ url: '/avatars/sophia/sophia.glb', body: 'F' })

// Make avatar speak
await head.speakText("Tell me about a time you led a team through ambiguity.")

// After avatar finishes, enable mic
head.addEventListener('speaking-stopped', () => enableMic())
```

---

## GLB Avatar Format Requirements (TalkingHead)

Any avatar GLB must have all three to work:

| Requirement | Detail |
|---|---|
| **Armature** | Root object named exactly `"Armature"` |
| **Skeleton** | Mixamo-compatible bone names (`Hips`, `Spine`, `Head`, `LeftArm`, etc.) |
| **Shape Keys** | 52 ARKit blend shapes + 15 Oculus viseme morph targets on the head mesh |

### 52 Required ARKit Shape Keys
```
eyeBlinkLeft, eyeBlinkRight, eyeLookDownLeft, eyeLookDownRight,
eyeLookInLeft, eyeLookInRight, eyeLookOutLeft, eyeLookOutRight,
eyeLookUpLeft, eyeLookUpRight, eyeSquintLeft, eyeSquintRight,
eyeWideLeft, eyeWideRight,
jawForward, jawLeft, jawOpen, jawRight,
mouthClose, mouthDimpleLeft, mouthDimpleRight, mouthFrownLeft,
mouthFrownRight, mouthFunnel, mouthLeft, mouthLowerDownLeft,
mouthLowerDownRight, mouthPressLeft, mouthPressRight, mouthPucker,
mouthRight, mouthRollLower, mouthRollUpper, mouthShrugLower,
mouthShrugUpper, mouthSmileLeft, mouthSmileRight, mouthStretchLeft,
mouthStretchRight, mouthUpperUpLeft, mouthUpperUpRight,
browDownLeft, browDownRight, browInnerUp, browOuterUpLeft, browOuterUpRight,
cheekPuff, cheekSquintLeft, cheekSquintRight,
noseSneerLeft, noseSneerRight, tongueOut
```

### 15 Required Oculus Viseme Shape Keys
```
viseme_sil, viseme_PP, viseme_FF, viseme_TH, viseme_DD,
viseme_kk, viseme_CH, viseme_SS, viseme_nn, viseme_RR,
viseme_aa, viseme_E, viseme_I, viseme_O, viseme_U
```

> **Important:** The shape keys currently exist at neutral position (no deformation).
> Sculpting the actual face deformations in Blender (e.g. open jaw for `jawOpen`, closed lids for `eyeBlinkLeft`) is required before expressions are visible.
> Body animations come from Mixamo motion clips applied to the skeleton automatically by TalkingHead.

---

## Current Avatars

Two photorealistic Renderpeople characters, fully processed and TalkingHead-ready.

### Sophia — HR / Behavioral Interviewer
```
avatars/sophia/sophia.glb     (7.78 MB)
avatars/sophia/sophia.blend   (Blender source)
```
- Female, early 30s, Mediterranean look, dark hair, white top
- Used for: Behavioral, Culture Fit, Leadership rounds
- TalkingHead body form: `'F'`

### Eric — Technical Interviewer
```
avatars/eric/eric.glb         (5.97 MB)
avatars/eric/eric.blend       (Blender source)
```
- Male, late 20s, athletic build
- Used for: Coding, System Design, Technical rounds
- TalkingHead body form: `'M'`

### Both avatars have
- `Armature` root object ✅
- 88 Mixamo-compatible bones (full body + fingers + face bones) ✅
- 68 shape keys: Basis + 52 ARKit + 15 Oculus visemes ✅
- PBR textures embedded in GLB ✅

---

## How to Add More Avatars Later

Same pipeline every time:

```
1. Get a Renderpeople rigged FBX (or any rigged FBX)
2. Import into Blender
3. Rename all bones to Mixamo names (Hips, Spine, LeftArm, etc.)
4. Rename armature object to "Armature"
5. Add 68 shape keys to the mesh (Basis + 52 ARKit + 15 Oculus)
6. Export as GLB with: morph=True, skins=True, apply=True
7. Drop into avatars/<name>/ folder
```

---

## Full Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Avatar rendering | **TalkingHead** (Three.js, browser) | Client-side, free, real-time lip sync |
| Avatar models | **GLB** (Renderpeople + Blender) | Photorealistic, one-time cost, reusable forever |
| TTS | Kokoro (self-hosted) or OpenAI TTS | Kokoro = free; OpenAI = $0.015/1K chars |
| ASR | Whisper (self-hosted) or OpenAI | Near-free, accurate |
| LLM | GPT-4o mini or Claude Sonnet | Questions, follow-ups, evaluation |
| Backend | FastAPI (Python) | Thin layer between LLM and frontend |
| Frontend | Next.js 14 + React | TalkingHead canvas lives here |
| DB | Supabase (Postgres + Auth) | Sessions, transcripts, feedback |

---

## Interview Flow

```
1. User fills setup form
   → Company, Role, Level, paste Resume + Job Description

2. Backend generates interview plan
   → LLM analyzes resume + JD → returns ordered list of rounds
   → e.g. Google Senior: Behavioral | Coding x2 | System Design | Leadership

3. Frontend shows round selector
   → User sees rounds as cards → clicks Start Round

4. Avatar screen loads
   → Avatar selected by round type (Eric for tech, Sophia for behavioral)
   → TalkingHead loads the GLB in browser

5. Round starts
   → LLM generates opening question personalized to resume + company
   → Text → TTS → audio → TalkingHead → avatar speaks with lip sync

6. User answers
   → Mic captures audio → Whisper → transcript
   → LLM generates follow-up → TTS → avatar speaks again
   → Loops for 3–5 questions per round

7. Round ends
   → Avatar says closing line
   → LLM evaluates round → score, hire signal, strengths, improvements

8. Next round → repeat from step 4

9. Final summary
   → All rounds side by side → overall hire recommendation → PDF report
```

---

## Avatar Selection Logic

```typescript
const AVATAR_MAP: Record<string, { url: string; body: 'M' | 'F' }> = {
  'Technical':     { url: '/avatars/eric/eric.glb',     body: 'M' },
  'Coding':        { url: '/avatars/eric/eric.glb',     body: 'M' },
  'System Design': { url: '/avatars/eric/eric.glb',     body: 'M' },
  'Behavioral':    { url: '/avatars/sophia/sophia.glb', body: 'F' },
  'Culture Fit':   { url: '/avatars/sophia/sophia.glb', body: 'F' },
  'Leadership':    { url: '/avatars/sophia/sophia.glb', body: 'F' },
  'default':       { url: '/avatars/eric/eric.glb',     body: 'M' },
}
```

---

## API Endpoints

```
POST /api/setup
  body: { resume, jd, company, role, level }
  returns: { session_id, rounds: [{ name, type }] }

POST /api/round/start
  body: { session_id, round_index }
  returns: { round_name, question_text, avatar_id }

POST /api/answer
  body: { session_id, answer_text }
  returns: { question_text, round_complete, feedback? }

POST /api/tts
  body: { text }
  returns: audio stream  ← fed directly to TalkingHead

GET /api/session/:id/summary
  returns: { round_feedbacks, overall_score, recommendation }
```

---

## Folder Structure

```
AVATAR-INTERVIEW/
  avatars/
    sophia/
      sophia.glb          ← TalkingHead-ready production file
      sophia.blend         ← editable Blender source
      *.jpg / *.tga        ← texture maps
    eric/
      eric.glb             ← TalkingHead-ready production file
      eric.blend           ← editable Blender source
      *.jpg                ← texture maps
  backend/
    main.py                ← FastAPI app
    interview_engine.py    ← LLM interview logic
    tts_service.py         ← TTS wrapper
    asr_service.py         ← Whisper ASR wrapper
    prompts.py             ← all system prompts
  frontend/
    public/
      avatars/             ← copy or symlink of avatars/
    src/
      components/
        AvatarCanvas.tsx   ← TalkingHead wrapper component
      app/
        page.tsx           ← setup screen
        interview/
          page.tsx         ← avatar + interview screen
        feedback/
          page.tsx         ← round feedback
        summary/
          page.tsx         ← final report
```

---

## Build Order

### Phase 1 — Prove the avatar speaks
- [ ] Clone TalkingHead or install via npm
- [ ] Serve `sophia.glb` from Next.js `public/avatars/sophia/`
- [ ] Load it in a bare page — avatar renders in browser
- [ ] Hardcode one sentence → avatar speaks with lip sync
- [ ] Confirm no console errors, mouth moves

### Phase 2 — Interview engine (no avatar switching yet)
- [ ] FastAPI backend with LLM question generation
- [ ] Single round: question → mic → Whisper → answer → follow-up
- [ ] Round ends → LLM returns feedback JSON

### Phase 3 — Full pipeline
- [ ] Kokoro TTS wired to TalkingHead `ttsEndpoint`
- [ ] Whisper ASR wired to mic recording
- [ ] Avatar switching by round type (Eric vs Sophia)

### Phase 4 — Production
- [ ] Supabase auth + session persistence
- [ ] PDF report generation
- [ ] Deploy to Vercel

---

## Estimated Cost at Scale

| Layer | Cost per 100 interviews (30 min each) |
|---|---|
| Avatar rendering (TalkingHead, client-side) | $0 |
| TTS (Kokoro self-hosted) | $0 |
| ASR (Whisper self-hosted) | $0 |
| LLM (GPT-4o mini, ~5K tokens/interview) | ~$0.15 |
| **Total** | **~$0.15 per 100 interviews** |
