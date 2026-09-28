import type { NextApiRequest, NextApiResponse } from 'next';

type RequestInput = {
  method?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
  query?: Record<string, string>;
  ip?: string;
};

export const fakeRequest = ({
  method = 'POST',
  headers = {},
  body = {},
  query = {},
  ip = '203.0.113.7',
}: RequestInput = {}): NextApiRequest =>
  ({
    method,
    headers: { 'x-forwarded-for': ip, ...headers },
    body,
    query,
    socket: { remoteAddress: ip },
  }) as unknown as NextApiRequest;

export type FakeResponse = NextApiResponse & {
  statusCode: number;
  headers: Record<string, string>;
  text: string;
  ended: boolean;
  json: () => unknown;
  close: () => void;
};

/** Just enough of a response to run an API route and read back what it wrote. */
export const fakeResponse = (): FakeResponse => {
  const listeners: Record<string, (() => void)[]> = {};
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    text: '',
    ended: false,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name.toLowerCase()] = value;
      return res;
    },
    writeHead(code: number, headers: Record<string, string> = {}) {
      res.statusCode = code;
      for (const [name, value] of Object.entries(headers)) res.headers[name.toLowerCase()] = value;
      return res;
    },
    write(chunk: string) {
      res.text += chunk;
      return true;
    },
    end(chunk?: string) {
      if (chunk) res.text += chunk;
      res.ended = true;
      return res;
    },
    on(event: string, listener: () => void) {
      listeners[event] = [...(listeners[event] ?? []), listener];
      return res;
    },
    close() {
      for (const listener of listeners.close ?? []) listener();
    },
  };
  const send = (payload: unknown) => {
    res.headers['content-type'] ??= 'application/json';
    res.text = JSON.stringify(payload);
    res.ended = true;
    return res;
  };
  return Object.assign(res, {
    json: (payload?: unknown) => (payload === undefined ? JSON.parse(res.text) : send(payload)),
  }) as unknown as FakeResponse;
};

export const VOICE_ENV = {
  NEXT_PUBLIC_VOICE_ENABLED: '1',
  BYTEPLUS_ACCESS_KEY_ID: 'AKTEST',
  BYTEPLUS_SECRET_ACCESS_KEY: 'sk-test',
  BYTEPLUS_RTC_APP_ID: '0123456789abcdef01234567',
  BYTEPLUS_RTC_APP_KEY: 'rtc-app-key',
  BYTEPLUS_ASR_APP_ID: 'asr-app',
  BYTEPLUS_ASR_ACCESS_TOKEN: 'asr-token',
  BYTEPLUS_TTS_APP_ID: 'tts-app',
  BYTEPLUS_TTS_TOKEN: 'tts-token',
  VOICE_LLM_SECRET: 'a-long-random-secret',
  VOICE_PUBLIC_BASE_URL: 'https://hall.example.test',
};

/** Every value that must never reach the browser or a log line. */
export const VOICE_SECRETS = [
  VOICE_ENV.BYTEPLUS_SECRET_ACCESS_KEY,
  VOICE_ENV.BYTEPLUS_RTC_APP_KEY,
  VOICE_ENV.BYTEPLUS_ASR_ACCESS_TOKEN,
  VOICE_ENV.BYTEPLUS_TTS_TOKEN,
  VOICE_ENV.VOICE_LLM_SECRET,
];
