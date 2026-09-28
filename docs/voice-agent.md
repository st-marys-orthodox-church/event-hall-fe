# Voice agent

A visitor can talk to the site's assistant instead of typing. The "Talk to us" button sits in
the chat widget; behind it is the same agent as the text chat, with the same knowledge, tools
and booking checks. English only for now.

Status: **built, not yet run against a real BytePlus account.** Everything up to the BytePlus
boundary is covered by tests; the first call with real credentials is the step that remains
(see [First call checklist](#first-call-checklist)).

## How a call works

```
browser                         this site                         BytePlus
───────                         ─────────                         ────────
"I agree, start the call"
  ask for the microphone
  POST /api/voice/start/ ─────► checks flag, consent, limits
                                 StartVoiceChat ──────────────────► agent joins the room
  ◄──────────────────────────── room token (expires at the cap)
  join the room with the RTC SDK ◄─────────── audio ─────────────►
                                                                    speech → text
                                 POST /api/voice/llm/ ◄──────────── every turn
                                 same agent + tools as the chat
                                 text stream ─────────────────────► text → speech
  subtitles, agent state ◄──────────────────────────────────────────
"End call"
  POST /api/voice/stop/ ──────► StopVoiceChat ───────────────────► agent leaves
```

- **BytePlus never sees a prompt, a tool or a booking.** It is configured with
  `LLMConfig.Mode: "CustomLLM"` pointing at `/api/voice/llm/`, and receives only the words to
  speak. The tool loop runs on our side (`src/server/chatLoop.ts`).
- **The browser chooses nothing about the agent.** `/api/voice/start` builds the whole
  StartVoiceChat request on the server (`src/server/voice/startConfig.ts`).
- **On-screen actions ride inside the reply.** Contact buttons and the "tour booked" card are
  sent as `[fx_…]` tags. Text-to-speech skips square brackets; the widget lifts the tags out of
  the subtitles (`src/utils/Voice.ts`).
- **Email and phone are typed, not spoken.** Speech recognition gets them wrong, so the call
  screen has a text box and the agent asks the visitor to use it.
- **The RTC SDK (about 600 kB gzipped) loads only after the visitor agrees to a call.** A page
  view without a call downloads none of it.

## Accounts and credentials

Nothing here exists yet. Each row is one value in the hosting environment.

| # | What | Env var | Where to get it |
|---|------|---------|-----------------|
| 1 | BytePlus account with billing | – | console.byteplus.com → sign up, add a card |
| 2 | Access key pair for an IAM sub-user | `BYTEPLUS_ACCESS_KEY_ID`, `BYTEPLUS_SECRET_ACCESS_KEY` | Console → IAM → create a user with RTC access → Key management |
| 3 | RTC application | `BYTEPLUS_RTC_APP_ID`, `BYTEPLUS_RTC_APP_KEY` | Console → BytePlus RTC → "Get started for free" → Application Management |
| 4 | Speech-to-text | `BYTEPLUS_ASR_APP_ID`, `BYTEPLUS_ASR_ACCESS_TOKEN` | Console → Seed Speech → activate ASR (streaming) |
| 5 | Text-to-speech | `BYTEPLUS_TTS_APP_ID`, `BYTEPLUS_TTS_TOKEN` | Console → Seed Speech → activate TTS 2.0 |
| 6 | Our own secret | `VOICE_LLM_SECRET` | `openssl rand -hex 32` |
| 7 | The switch | `NEXT_PUBLIC_VOICE_ENABLED=1` | Set last, and redeploy: it is read at build time |

The chat model is whatever `CHAT_PROVIDER` already points at. **A ModelArk key is not needed
for voice**, and Gemini is the safer choice: the United States is not on ModelArk's list of
countries where the service is sold.

## First call checklist

In order. Each step rules out one thing before the next depends on it.

1. Set every variable above on a **preview** deployment, with `VOICE_PUBLIC_BASE_URL` set to
   that deployment's URL. The URL must be reachable without a login, or BytePlus cannot call it.
2. `VOICE_LLM_SECRET=… pnpm smoke:voice --url https://<preview>` — confirms voice is on and
   configured, and asks the agent one real question. Note the time to first byte.
3. Optional: BytePlus's own validator, downloaded from the "Integrate Third-Party Model" page
   of its docs. Step 2 ends by printing the exact command to run, with a short-lived session
   in the URL.
4. Open the preview, start a call, say hello. If it does not connect, the server log has the
   BytePlus error code and request id.
5. Listen to the voice. Change `VOICE_TTS_SPEAKER` until it suits the venue.
6. Book a tour by voice, end to end, against the dev calendar.
7. Close the tab mid-call and confirm in the BytePlus console that the agent task ended
   within seconds, not after three minutes.

If step 4 fails with a signature or parameter error, these are the known disagreements
between BytePlus's docs and its sample app. Each can be switched without a code change:

| Setting | We send (per the docs) | The sample app sends | How to switch |
|---------|------------------------|----------------------|---------------|
| API host and region | `open.byteplusapi.com`, `ap-singapore-1` | `rtc.ap-southeast-1.byteplusapi.com`, `ap-southeast-1` | `BYTEPLUS_OPENAPI_URL`, `BYTEPLUS_OPENAPI_REGION` |
| TTS provider name | `BytePlus` | `byteplus_Bidirectional_streaming` | `VOICE_CONFIG_OVERRIDES={"TTSConfig":{"Provider":"…"}}` |
| History length | `20` (maximum not documented) | default `3` | `VOICE_CONFIG_OVERRIDES={"LLMConfig":{"HistoryLength":10}}` |

## What a call costs

From BytePlus's billing pages as of 2026-09-28; check them before budgeting.

| Item | Rate |
|------|------|
| RTC audio, charged for the visitor and for the agent | $0.99 per 1,000 minutes each |
| Conversational AI audio processing | $1.29 per 1,000 minutes |
| Speech-to-text, streaming | $0.15 per hour |
| Text-to-speech | $30 per million characters |
| The chat model | as for the text chat |

Roughly two cents a minute, most of it text-to-speech. The limits that bound it:

- A call ends at `VOICE_MAX_SESSION_SECONDS` (6 minutes): the room token expires.
- A visitor gets 3 calls a day; the site takes `VOICE_DAILY_SESSION_CAP` (40) a day.
- An agent left behind by a closed tab is stopped by a beacon; if that is lost, BytePlus stops
  it after 180 seconds.

The daily cap is counted in memory, per server instance. It stops a runaway; it is not an
exact budget. An exact one needs a shared store (Vercel KV, Upstash).

## Testing

| Command | What it proves |
|---------|----------------|
| `pnpm test` | The wire formats (room token and request signature, each checked against BytePlus's own reference), the three API routes, the call state machine, the call screen |
| `pnpm smoke:voice` | The real Next server, with stand-ins for BytePlus and the chat model: a call is started, a turn is answered in the exact shape BytePlus requires, the call is stopped |
| `pnpm smoke:voice --url <site>` | A deployed site is switched on, configured, refuses what it should, and answers a real question in time. Starts no call, costs nothing |
| `pnpm smoke:voice --stubs` | Runs only the stand-ins, to click through the widget locally (launch config `event-hall-voice-dev`) |

What no test here can show, because it needs a BytePlus account: that BytePlus accepts our
StartVoiceChat request, how the voice sounds, how long a turn takes from Georgia, and whether
the action tags survive in the subtitles.

## Open questions

- **Where the audio goes.** BytePlus's API reports the region `ap-singapore-1`. Where speech
  is processed and how long anything is kept is not published. The consent screen says the
  audio leaves the United States; someone with authority should confirm the parish is
  comfortable with that.
- **The consent wording** (`voice.consent` in `public/locales/*/chat.json`) was written by an
  engineer, not reviewed by counsel. The site has no privacy page to link it to.
- **The 10-second limit.** BytePlus gives a custom model 10 seconds. We answer the first byte
  at once, so a slow booking turn is safe if the limit is on the first byte, and not if it is
  on the whole reply. Step 6 of the checklist settles it.
- **Whether a US customer can buy RTC and Seed Speech at all.** Unconfirmed; ask BytePlus sales.

## Not built

- Spanish and Romanian voice. BytePlus's voices now cover Spanish; Romanian would need a
  different text-to-speech provider (StartVoiceChat accepts Google, Amazon and OpenAI).
- The phone line. `/api/voice/llm` does not care how the audio arrived, so a telephony
  provider that can call a custom model can reuse it.
