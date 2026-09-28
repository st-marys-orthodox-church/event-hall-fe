import { createHash, createHmac } from 'node:crypto';
import type { VoiceConfig } from './config';

const SERVICE = 'rtc';
const API_VERSION = '2025-05-01';
const TIMEOUT_MS = 8000;

const sha256Hex = (data: string): string => createHash('sha256').update(data).digest('hex');

const hmac = (key: string | Buffer, data: string): Buffer =>
  createHmac('sha256', key).update(data).digest();

const encode = (value: string): string =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );

type SignInput = {
  method: 'GET' | 'POST';
  host: string;
  query: Record<string, string>;
  contentType: string;
  body: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  now?: Date;
};

const SIGNED_HEADERS = 'content-type;host;x-content-sha256;x-date';

type CanonicalInput = {
  method: 'GET' | 'POST';
  host: string;
  queryString: string;
  contentType: string;
  bodyHash: string;
  date: string;
};

export const canonicalRequest = ({
  method,
  host,
  queryString,
  contentType,
  bodyHash,
  date,
}: CanonicalInput): string =>
  [
    method,
    '/',
    queryString,
    `content-type:${contentType}`,
    `host:${host}`,
    `x-content-sha256:${bodyHash}`,
    `x-date:${date}`,
    '',
    SIGNED_HEADERS,
    bodyHash,
  ].join('\n');

type SignatureInput = {
  secretAccessKey: string;
  region: string;
  date: string;
  canonicalRequestHash: string;
};

export const signatureFor = ({
  secretAccessKey,
  region,
  date,
  canonicalRequestHash,
}: SignatureInput): string => {
  const day = date.slice(0, 8);
  const scope = `${day}/${region}/${SERVICE}/request`;
  const stringToSign = ['HMAC-SHA256', date, scope, canonicalRequestHash].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(secretAccessKey, day), region), SERVICE), 'request');
  return hmac(signingKey, stringToSign).toString('hex');
};

/** BytePlus's request signature: the AWS v4 scheme with its own algorithm name and headers. */
export const signOpenApiRequest = ({
  method,
  host,
  query,
  contentType,
  body,
  accessKeyId,
  secretAccessKey,
  region,
  now = new Date(),
}: SignInput): { queryString: string; headers: Record<string, string> } => {
  const date = now.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const bodyHash = sha256Hex(body);
  const queryString = Object.keys(query)
    .sort()
    .map((key) => `${encode(key)}=${encode(query[key] ?? '')}`)
    .join('&');
  const signature = signatureFor({
    secretAccessKey,
    region,
    date,
    canonicalRequestHash: sha256Hex(
      canonicalRequest({ method, host, queryString, contentType, bodyHash, date })
    ),
  });
  const scope = `${date.slice(0, 8)}/${region}/${SERVICE}/request`;

  return {
    queryString,
    headers: {
      'Content-Type': contentType,
      'X-Content-Sha256': bodyHash,
      'X-Date': date,
      Authorization: `HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${SIGNED_HEADERS}, Signature=${signature}`,
    },
  };
};

type OpenApiResponse = {
  ResponseMetadata?: { RequestId?: string; Error?: { Code?: string; Message?: string } };
  Error?: { Code?: string; Message?: string };
};

export class OpenApiError extends Error {
  constructor(
    readonly action: string,
    readonly code: string,
    message: string,
    readonly requestId?: string
  ) {
    super(`${action} failed: ${code} ${message}`);
  }
}

/** Calls one of the RTC conversational-AI actions (StartVoiceChat, StopVoiceChat). */
export const callVoiceChatApi = async (
  action: 'StartVoiceChat' | 'StopVoiceChat',
  payload: Record<string, unknown>,
  config: VoiceConfig
): Promise<void> => {
  const body = JSON.stringify(payload);
  const { host } = new URL(config.openApiUrl);
  const { queryString, headers } = signOpenApiRequest({
    method: 'POST',
    host,
    query: { Action: action, Version: API_VERSION },
    contentType: 'application/json',
    body,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.openApiRegion,
  });

  const response = await fetch(`${config.openApiUrl}/?${queryString}`, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const result = (await response.json().catch(() => ({}))) as OpenApiResponse;
  // Some API versions answer 200 and report the failure in the body.
  const error = result.ResponseMetadata?.Error ?? result.Error;
  if (!response.ok || error) {
    throw new OpenApiError(
      action,
      error?.Code ?? `HTTP ${response.status}`,
      error?.Message ?? '',
      result.ResponseMetadata?.RequestId
    );
  }
};
