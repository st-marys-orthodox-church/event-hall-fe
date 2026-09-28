#!/usr/bin/env node
// Smoke test for the voice agent: drives a real call's HTTP traffic through a running server.
//
//   pnpm smoke:voice
//       Self-contained. Boots this app on a spare port with stand-ins for BytePlus and for the
//       chat model, then plays a whole call: start, one turn as BytePlus would send it, stop.
//       Needs no account and makes no outside request.
//
//   pnpm smoke:voice --url https://events.saintmaryro.org
//       Against a server that is already running. Read-only: it never starts a call, so it
//       costs nothing. With VOICE_LLM_SECRET in the environment (or .env.local) it also asks
//       the agent one real question and times the answer against BytePlus's 10 s limit.
//
//   pnpm smoke:voice --stubs
//       Only runs the stand-ins, on port 4610, and prints the environment a dev server needs
//       to use them. For trying the widget by hand without an account.

import { spawn } from 'node:child_process';
import { createHash, createHmac } from 'node:crypto';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const STUB_PORT = 4610;
const FIRST_BYTE_BUDGET_MS = 10_000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

const STUB_ENV = {
  NEXT_PUBLIC_VOICE_ENABLED: '1',
  NEXT_PUBLIC_CHAT_ENABLED: '1',
  NEXT_PUBLIC_DEV: '1',
  BYTEPLUS_ACCESS_KEY_ID: 'AKSMOKE',
  BYTEPLUS_SECRET_ACCESS_KEY: 'smoke-secret-access-key',
  BYTEPLUS_OPENAPI_REGION: 'ap-singapore-1',
  BYTEPLUS_RTC_APP_ID: '0123456789abcdef01234567',
  BYTEPLUS_RTC_APP_KEY: 'smoke-rtc-app-key',
  BYTEPLUS_ASR_APP_ID: 'smoke-asr-app',
  BYTEPLUS_ASR_ACCESS_TOKEN: 'smoke-asr-token',
  BYTEPLUS_TTS_APP_ID: 'smoke-tts-app',
  BYTEPLUS_TTS_TOKEN: 'smoke-tts-token',
  VOICE_LLM_SECRET: 'smoke-llm-secret',
  CHAT_PROVIDER: 'modelark',
  MODELARK_API_KEY: 'smoke-model-key',
  MODELARK_MODEL: 'smoke-model',
  // Emptied so a tool call cannot reach the real calendar or send a real email.
  CALENDAR_ICS_URL: '',
  PUBLIC_EVENTS_ICS_URL: '',
  ZOHO_CLIENT_ID: '',
  ZOHO_CLIENT_SECRET: '',
  ZOHO_REFRESH_TOKEN: '',
  ZOHO_VIEWINGS_CALENDAR_UID: '',
  SENDGRID_API_KEY: '',
};

// ── Reporting ────────────────────────────────────────────────────────────────

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? `  (${detail})` : ''}`);
  return ok;
};
const section = (title) => console.log(`\n${title}`);

// ── Wire formats, written out again here so the test does not trust the code it tests ────────

const hmac = (key, data) => createHmac('sha256', key).update(data).digest();
const sha256 = (data) => createHash('sha256').update(data).digest('hex');

const expectedSignature = ({ secret, region, method, host, query, contentType, body, date }) => {
  const day = date.slice(0, 8);
  const canonical = [
    method,
    '/',
    [...new URLSearchParams(query).entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&'),
    `content-type:${contentType}`,
    `host:${host}`,
    `x-content-sha256:${sha256(body)}`,
    `x-date:${date}`,
    '',
    'content-type;host;x-content-sha256;x-date',
    sha256(body),
  ].join('\n');
  const toSign = ['HMAC-SHA256', date, `${day}/${region}/rtc/request`, sha256(canonical)].join(
    '\n'
  );
  const key = hmac(hmac(hmac(hmac(secret, day), region), 'rtc'), 'request');
  return hmac(key, toSign).toString('hex');
};

const derive = (secret, purpose) => createHmac('sha256', secret).update(purpose).digest('hex');

const sealSession = (session, secret) => {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${hmac(derive(secret, 'session'), payload).toString('base64url')}`;
};

const readActions = (text) =>
  [...text.matchAll(/\[\s*fx_([A-Za-z0-9_\-\s]+)\]/g)].map((match) =>
    JSON.parse(Buffer.from(match[1].replace(/\s+/g, ''), 'base64url').toString())
  );

// ── Stand-ins for BytePlus and for the chat model ────────────────────────────

const readBody = (req) =>
  new Promise((resolve) => {
    const parts = [];
    req.on('data', (part) => parts.push(part));
    req.on('end', () => resolve(Buffer.concat(parts).toString()));
  });

const startStubs = (port) =>
  new Promise((resolve) => {
    const received = { openApi: [], model: [] };

    const openApi = async (req, res, url) => {
      const body = await readBody(req);
      const auth = req.headers.authorization ?? '';
      const signature = expectedSignature({
        secret: STUB_ENV.BYTEPLUS_SECRET_ACCESS_KEY,
        region: STUB_ENV.BYTEPLUS_OPENAPI_REGION,
        method: req.method,
        host: req.headers.host,
        query: url.search,
        contentType: req.headers['content-type'],
        body,
        date: req.headers['x-date'] ?? '',
      });
      const signed =
        auth.startsWith(`HMAC-SHA256 Credential=${STUB_ENV.BYTEPLUS_ACCESS_KEY_ID}/`) &&
        auth.endsWith(`Signature=${signature}`) &&
        req.headers['x-content-sha256'] === sha256(body);
      received.openApi.push({
        action: url.searchParams.get('Action'),
        version: url.searchParams.get('Version'),
        signed,
        body: JSON.parse(body || '{}'),
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify(
          signed
            ? { Result: 'success', ResponseMetadata: { RequestId: 'smoke' } }
            : {
                ResponseMetadata: {
                  RequestId: 'smoke',
                  Error: { Code: 'SignatureDoesNotMatch', Message: 'bad signature' },
                },
              }
        )
      );
    };

    // Asks for a date check on the first round, then answers from its result, like a model
    // that was asked about a date.
    const model = async (req, res) => {
      const request = JSON.parse(await readBody(req));
      received.model.push(request);
      const afterTool = request.messages.some((message) => message.role === 'tool');
      const send = (delta, finish = null) =>
        res.write(
          `data: ${JSON.stringify({ choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`
        );
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      if (afterTool) {
        send({ content: 'I could not check that date just now, ' });
        send({ content: 'but you can call or message us.' });
      } else {
        send({ content: 'Let me check that. ' });
        send({
          tool_calls: [
            {
              index: 0,
              id: 'call_smoke',
              type: 'function',
              function: { name: 'check_date_availability', arguments: '{"date":"2099-06-14"}' },
            },
          ],
        });
      }
      send({}, 'stop');
      res.end('data: [DONE]\n\n');
    };

    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.endsWith('/chat/completions')) return model(req, res);
      if (url.searchParams.has('Action')) return openApi(req, res, url);
      res.writeHead(404).end();
    });
    server.listen(port, '127.0.0.1', () => {
      const { port: bound } = server.address();
      resolve({
        received,
        origin: `http://127.0.0.1:${bound}`,
        env: {
          BYTEPLUS_OPENAPI_URL: `http://127.0.0.1:${bound}`,
          MODELARK_BASE_URL: `http://127.0.0.1:${bound}/api/v3`,
        },
        close: () => server.close(),
      });
    });
  });

// ── The app under test ───────────────────────────────────────────────────────

const freePort = () =>
  new Promise((resolve) => {
    const probe = createServer().listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

const DIST_DIR = '.next-smoke';
const NEXT_ENV_FILE = join(ROOT, 'next-env.d.ts');

const bootApp = async (env, readyStatus = 405) => {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  // Next rewrites this checked-in file to point at whichever build folder it runs from.
  const nextEnv = readFileSync(NEXT_ENV_FILE, 'utf8');
  const tidy = () => {
    writeFileSync(NEXT_ENV_FILE, nextEnv);
    rmSync(join(ROOT, DIST_DIR), { recursive: true, force: true });
  };
  const child = spawn(
    join(ROOT, 'node_modules', '.bin', 'next'),
    ['dev', '--turbopack', '-p', String(port), '-H', '127.0.0.1'],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        ...env,
        NEXT_DIST_DIR: DIST_DIR,
        VOICE_PUBLIC_BASE_URL: base,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  let log = '';
  child.stdout.on('data', (data) => {
    log += data;
  });
  child.stderr.on('data', (data) => {
    log += data;
  });

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) break;
    try {
      const res = await fetch(`${base}/api/voice/stop/`, { signal: AbortSignal.timeout(60_000) });
      if (res.status === readyStatus) {
        const stop = () =>
          new Promise((resolve) => {
            child.once('exit', () => resolve(tidy()));
            child.kill('SIGTERM');
          });
        return { base, stop, log: () => log };
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill('SIGTERM');
  tidy();
  throw new Error(`The app did not come up.\n${log}`);
};

// ── Checks ───────────────────────────────────────────────────────────────────

const postJson = (url, body, headers = {}) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    redirect: 'manual',
  });

const HUMAN = { locale: 'en', consent: true, website: '', fillTime: 5000 };

/** One turn, sent the way BytePlus sends it, and held to what BytePlus requires of the answer. */
const checkTurn = async ({ url, apiKey, headers, custom, question }) => {
  const sentAt = Date.now();
  const res = await postJson(
    url,
    {
      messages: [{ role: 'user', content: question }],
      stream: true,
      model: 'fellowship-event-hall',
      temperature: 0.1,
      max_tokens: 1024,
      ...(custom ? { custom } : {}),
    },
    { Authorization: `Bearer ${apiKey}`, ...headers }
  );
  check(
    'answers directly, without a redirect BytePlus might not follow',
    res.status === 200,
    `HTTP ${res.status}`
  );
  if (res.status !== 200) {
    console.log(`       ${(await res.text()).slice(0, 300)}`);
    return null;
  }
  check(
    'answers as text/event-stream',
    (res.headers.get('content-type') ?? '').startsWith('text/event-stream'),
    res.headers.get('content-type')
  );

  let raw = '';
  let firstByteMs = 0;
  const decoder = new TextDecoder();
  for await (const part of res.body) {
    firstByteMs ||= Date.now() - sentAt;
    raw += decoder.decode(part, { stream: true });
  }
  const totalMs = Date.now() - sentAt;
  const events = raw.split('\n\n').filter(Boolean);
  const chunks = events
    .filter((event) => event !== 'data: [DONE]')
    .map((event) => JSON.parse(event.replace(/^data: /, '')));

  check(
    `first byte within BytePlus's 10 s limit`,
    firstByteMs > 0 && firstByteMs < FIRST_BYTE_BUDGET_MS,
    `${firstByteMs} ms to first byte, ${totalMs} ms in all`
  );
  if (totalMs >= FIRST_BYTE_BUDGET_MS) {
    console.log(
      '       note: the whole answer took over 10 s; fine only if the limit is on the first byte'
    );
  }
  check('ends with data: [DONE]', events.at(-1) === 'data: [DONE]');
  check(
    'every chunk is a chat.completion.chunk under one id',
    chunks.length > 1 &&
      chunks.every(
        (chunk) =>
          chunk.object === 'chat.completion.chunk' &&
          chunk.id === chunks[0].id &&
          Number.isInteger(chunk.created) &&
          typeof chunk.model === 'string' &&
          chunk.choices?.length === 1 &&
          chunk.choices[0].index === 0 &&
          typeof chunk.choices[0].delta === 'object'
      )
  );
  check('opens with the assistant role', chunks[0]?.choices[0].delta.role === 'assistant');
  check('closes with a finish reason', chunks.at(-1)?.choices[0].finish_reason === 'stop');

  const reply = chunks.map((chunk) => chunk.choices[0].delta.content ?? '').join('');
  check('says something', reply.replace(/\[[^\]]*\]/g, '').trim().length > 0);
  return reply;
};

const checkRefusals = async (base) => {
  section('Refusals');
  const noConsent = await postJson(`${base}/api/voice/start/`, { ...HUMAN, consent: false });
  const noConsentBody = await noConsent.json().catch(() => ({}));
  check(
    'a call without consent is refused',
    noConsent.status === 400 && noConsentBody.error === 'consent_required',
    `HTTP ${noConsent.status} ${noConsentBody.error ?? ''}`
  );

  const spanish = await postJson(`${base}/api/voice/start/`, { ...HUMAN, locale: 'es' });
  check('a call in Spanish is refused', spanish.status === 400, `HTTP ${spanish.status}`);

  const stranger = await postJson(
    `${base}/api/voice/llm/`,
    { messages: [{ role: 'user', content: 'hello' }] },
    { Authorization: 'Bearer not-the-key' }
  );
  const strangerBody = await stranger.json().catch(() => ({}));
  check(
    'the model endpoint refuses a caller without the key, in the shape BytePlus reads',
    stranger.status === 401 && strangerBody.Error?.Code === 'AuthenticationError',
    `HTTP ${stranger.status}`
  );

  const stop = await postJson(`${base}/api/voice/stop/`, { session: 'not.ours' });
  check(
    'a stop for a session we did not issue is refused',
    stop.status === 400,
    `HTTP ${stop.status}`
  );
};

const smokeLocal = async () => {
  console.log('Booting the app with stand-ins for BytePlus and the chat model…');
  const stubs = await startStubs(0);
  let app;
  try {
    app = await bootApp({ ...STUB_ENV, ...stubs.env });
    console.log(`App at ${app.base}, stand-ins at ${stubs.origin}`);

    await checkRefusals(app.base);
    check(
      'nothing reached BytePlus while calls were being refused',
      stubs.received.openApi.length === 0
    );

    section('Starting a call');
    const started = await postJson(`${app.base}/api/voice/start/`, {
      ...HUMAN,
      leadSource: { source: 'smoke', medium: 'test' },
    });
    const call = await started.json().catch(() => ({}));
    if (
      !check(
        'the call starts',
        started.status === 200,
        `HTTP ${started.status} ${call.error ?? ''}`
      )
    ) {
      console.log(app.log().slice(-2000));
      return;
    }
    const [startRequest] = stubs.received.openApi;
    check('BytePlus was asked to StartVoiceChat', startRequest?.action === 'StartVoiceChat');
    check(
      'on the current API version',
      startRequest?.version === '2025-05-01',
      startRequest?.version
    );
    check('with a signature BytePlus would accept', startRequest?.signed === true);
    check(
      'the agent joins the room the visitor holds a token for',
      startRequest?.body.RoomId === call.roomId &&
        startRequest?.body.AgentConfig?.TargetUserID?.[0] === call.userId &&
        startRequest?.body.AgentConfig?.UserID === call.agentUserId
    );
    check(
      'the room token is for this app and is not empty',
      typeof call.token === 'string' && call.token.startsWith(`001${STUB_ENV.BYTEPLUS_RTC_APP_ID}`)
    );
    const secrets = Object.entries(STUB_ENV)
      .filter(
        ([name, value]) => value && /KEY|TOKEN|SECRET/.test(name) && name !== 'BYTEPLUS_RTC_APP_ID'
      )
      .map(([, value]) => value);
    check(
      'the browser was given no credential',
      secrets.every((secret) => !JSON.stringify(call).includes(secret))
    );

    section('A turn, as BytePlus sends it');
    const llm = startRequest.body.Config.LLMConfig;
    check('BytePlus was pointed at this app', llm.Url.startsWith(app.base), llm.Url);
    const reply = await checkTurn({
      url: llm.Url,
      apiKey: llm.APIKey,
      headers: llm.ExtraHeader,
      question: 'Is June 14 open?',
    });
    if (reply !== null) {
      check(
        'the words of both model rounds are there, tool call in between',
        reply.includes('Let me check that.') && reply.includes('you can call or message us.')
      );
      const actions = readActions(reply);
      check(
        'the tool put contact buttons on screen, carried inside the reply',
        actions.some((action) => action.action === 'contact'),
        `${actions.length} action(s)`
      );
      const [first, second] = stubs.received.model;
      check(
        'the model was given the voice rules on top of the chat prompt',
        first?.messages[0]?.content.includes('<voice_call>') &&
          first?.messages[0]?.content.includes('<booking_a_tour>')
      );
      check(
        'and the tool result on its second round',
        second?.messages.some((message) => message.role === 'tool')
      );
    }

    section('The same turn when only the request body is passed through');
    await checkTurn({
      url: llm.Url,
      apiKey: llm.APIKey,
      headers: {},
      custom: llm.Custom,
      question: 'How many guests fit?',
    });

    section('Hanging up');
    const stopped = await postJson(`${app.base}/api/voice/stop/`, { session: call.session });
    check('the stop is accepted', stopped.status === 200, `HTTP ${stopped.status}`);
    const stopRequest = stubs.received.openApi.at(-1);
    check(
      'BytePlus was asked to stop that same agent',
      stopRequest?.action === 'StopVoiceChat' &&
        stopRequest.signed &&
        stopRequest.body.RoomId === call.roomId &&
        stopRequest.body.TaskId === startRequest.body.TaskId
    );
    const beacon = await fetch(`${app.base}/api/voice/stop/`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ session: call.session }),
    });
    check(
      'a closing page can stop the call with a beacon',
      beacon.status === 200,
      `HTTP ${beacon.status}`
    );

    section('The page');
    let page = await fetch(`${app.base}/`);
    if (page.status !== 200) {
      // The dev server's first compile of a page has been seen to fail once and then work.
      // One retry, with the log of the failure shown so a real cause is not hidden.
      console.log(
        `  note  first request for the home page gave HTTP ${page.status}; retrying once`
      );
      console.log(app.log().slice(-2000));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      page = await fetch(`${app.base}/`);
    }
    const html = await page.text();
    check(
      'the home page renders with voice switched on',
      page.status === 200,
      `HTTP ${page.status}`
    );
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(([, src]) => src);
    const sources = await Promise.all(
      scripts.map((src) => fetch(new URL(src, app.base)).then((res) => res.text()))
    );
    check(
      'and loads neither the call screen nor the RTC SDK until a visitor asks for a call',
      scripts.length > 0 &&
        sources.every((source) => !source.includes('onRoomBinaryMessageReceived')),
      `${scripts.length} scripts on the page`
    );

    section('With the switch off');
    await app.stop();
    app = undefined;
    const before = stubs.received.openApi.length;
    // Every credential stays in place: the switch alone has to keep voice out of reach.
    app = await bootApp({ ...STUB_ENV, ...stubs.env, NEXT_PUBLIC_VOICE_ENABLED: '' }, 404);
    const session = sealSession(
      {
        roomId: 'hall_off',
        taskId: 'task_off',
        userId: 'visitor_off',
        agentUserId: 'agent_off',
        ip: '127.0.0.1',
        leadSource: null,
        expiresAt: Math.floor(Date.now() / 1000) + 120,
      },
      STUB_ENV.VOICE_LLM_SECRET
    );
    const closed = await Promise.all([
      postJson(`${app.base}/api/voice/start/`, HUMAN),
      postJson(`${app.base}/api/voice/stop/`, { session }),
      postJson(
        `${app.base}/api/voice/llm/`,
        { messages: [{ role: 'user', content: 'hello' }] },
        {
          Authorization: `Bearer ${derive(STUB_ENV.VOICE_LLM_SECRET, 'bearer')}`,
          'x-voice-session': session,
        }
      ),
    ]);
    check(
      'start, stop and the model endpoint all answer 404, valid credentials or not',
      closed.every((res) => res.status === 404),
      closed.map((res) => `HTTP ${res.status}`).join(', ')
    );
    check('nothing reached BytePlus', stubs.received.openApi.length === before);
    const chatStill = await postJson(`${app.base}/api/chat/`, {
      ...HUMAN,
      locale: 'en',
      messages: [{ role: 'user', content: 'How many guests fit?' }],
    });
    const chatText = await chatStill.text();
    check(
      'the text chat still answers',
      chatStill.status === 200 && chatText.includes('"type":"done"'),
      `HTTP ${chatStill.status}`
    );
    const offPage = await fetch(`${app.base}/`);
    check('the home page renders', offPage.status === 200, `HTTP ${offPage.status}`);
  } finally {
    await app?.stop();
    stubs.close();
  }
};

const loadEnvLocal = () => {
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
      }
    }
  } catch {
    // No .env.local.
  }
};

const smokeRemote = async (base) => {
  console.log(`Checking ${base} (read-only: no call is started)`);
  const probe = await postJson(`${base}/api/voice/start/`, {});
  if (probe.status === 404) {
    check('voice is switched on', false, 'NEXT_PUBLIC_VOICE_ENABLED is not 1 on this deployment');
    return;
  }
  check('voice is switched on', true);
  check('voice is configured', probe.status !== 503, `HTTP ${probe.status}`);
  await checkRefusals(base);

  loadEnvLocal();
  const secret = process.env.VOICE_LLM_SECRET;
  section('A real turn');
  if (!secret) {
    console.log(
      "  skip  set VOICE_LLM_SECRET to the deployment's value to ask the agent a question"
    );
    return;
  }
  const session = sealSession(
    {
      roomId: `smoke_${Date.now()}`,
      taskId: 'smoke',
      userId: 'smoke_visitor',
      agentUserId: 'smoke_agent',
      ip: '127.0.0.1',
      leadSource: null,
      expiresAt: Math.floor(Date.now() / 1000) + 120,
    },
    secret
  );
  const reply = await checkTurn({
    url: `${base}/api/voice/llm/`,
    apiKey: derive(secret, 'bearer'),
    headers: { 'x-voice-session': session },
    question: 'How many guests does the hall hold?',
  });
  if (reply) console.log(`\n  The agent said: ${reply.replace(/\[[^\]]*\]/g, '').trim()}`);

  console.log("\n  To run BytePlus's own validator against this deployment (valid for 2 minutes):");
  console.log(
    `  ./app-mac '${base}/api/voice/llm/?session=${session}' fellowship-event-hall ${derive(secret, 'bearer')} 'How many guests fit?'`
  );
};

// ── Entry ────────────────────────────────────────────────────────────────────

if (flag('--stubs')) {
  const stubs = await startStubs(STUB_PORT);
  console.log(`Stand-ins for BytePlus and the chat model are listening on ${stubs.origin}.\n`);
  console.log('Start a dev server with this environment to use them:\n');
  for (const [name, value] of Object.entries({ ...STUB_ENV, ...stubs.env })) {
    console.log(`${name}=${value}`);
  }
  console.log('\nA call will get as far as joining the room, which needs a real BytePlus account.');
} else {
  const url = option('--url');
  try {
    if (url) await smokeRemote(url.replace(/\/$/, ''));
    else await smokeLocal();
  } catch (err) {
    failures += 1;
    console.error(`\n${err instanceof Error ? err.message : err}`);
  }
  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}
