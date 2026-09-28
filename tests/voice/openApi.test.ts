import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { voiceConfig } from '../../src/server/voice/config';
import {
  OpenApiError,
  callVoiceChatApi,
  canonicalRequest,
  signOpenApiRequest,
  signatureFor,
} from '../../src/server/voice/openApi';
import { VOICE_ENV } from '../helpers/http';

// The worked example in https://docs.byteplus.com/en/docs/byteplus-rtc/docs-69859. Its secret
// key is a published sample with no permissions. Its access key id is left out: it names the
// signer in the header but takes no part in the signature, and it trips secret scanners.
const GUIDE = {
  accessKeyId: 'ACCESS-KEY-ID',
  secretAccessKey: 'TnpCak5XWXpZV1U0WkRaaE5ERmxaR0ZpTmpjeVkyUXlZek0wTWpJMU1qWQ==',
  region: 'ap-singapore-1',
  host: 'open.byteplusapi.com',
  contentType: 'application/x-www-form-urlencoded; charset=utf-8',
  date: '20201230T081805Z',
  queryString:
    'Action=GetRecordTask&AppId=Your_AppId&RoomId=Your_RoomId&TaskId=Your_TaskId&Version=2022-06-01',
  emptyBodyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  canonicalRequestHash: '347e7f5324998a2c7984370c3c50dc75bf9e6b449ea498a6bf8864d94cbd84b9',
  signature: '0d7e689b7d7949fa8b0132f5718b8f3b0d25cf7ea6c46eea33d91efd79f1e973',
};

describe('signOpenApiRequest', () => {
  it("lays the canonical request out as BytePlus's signing guide does", () => {
    const request = canonicalRequest({
      method: 'GET',
      host: GUIDE.host,
      queryString: GUIDE.queryString,
      contentType: GUIDE.contentType,
      bodyHash: GUIDE.emptyBodyHash,
      date: GUIDE.date,
    });
    // The guide's own canonical request misprints the body hash in its header line ("4zc8996")
    // and every figure after it was computed from that misprint. Reproducing the misprint is
    // what proves the layout matches theirs byte for byte.
    const asPrinted = request.replace(
      `x-content-sha256:${GUIDE.emptyBodyHash}`,
      `x-content-sha256:${GUIDE.emptyBodyHash.replace('afbf4c8996', 'afbf4zc8996')}`
    );
    expect(createHash('sha256').update(asPrinted).digest('hex')).toBe(GUIDE.canonicalRequestHash);
  });

  it("derives the guide's signature from the guide's canonical request", () => {
    expect(
      signatureFor({
        secretAccessKey: GUIDE.secretAccessKey,
        region: GUIDE.region,
        date: GUIDE.date,
        canonicalRequestHash: GUIDE.canonicalRequestHash,
      })
    ).toBe(GUIDE.signature);
  });

  it('sorts the query and assembles the header the guide ends with', () => {
    const { queryString, headers } = signOpenApiRequest({
      method: 'GET',
      host: GUIDE.host,
      query: {
        Version: '2022-06-01',
        TaskId: 'Your_TaskId',
        Action: 'GetRecordTask',
        RoomId: 'Your_RoomId',
        AppId: 'Your_AppId',
      },
      contentType: GUIDE.contentType,
      body: '',
      accessKeyId: GUIDE.accessKeyId,
      secretAccessKey: GUIDE.secretAccessKey,
      region: GUIDE.region,
      now: new Date('2020-12-30T08:18:05Z'),
    });

    expect(queryString).toBe(GUIDE.queryString);
    expect(headers['X-Date']).toBe(GUIDE.date);
    expect(headers['X-Content-Sha256']).toBe(GUIDE.emptyBodyHash);
    expect(headers.Authorization).toMatch(
      new RegExp(
        `^HMAC-SHA256 Credential=${GUIDE.accessKeyId}/20201230/ap-singapore-1/rtc/request, SignedHeaders=content-type;host;x-content-sha256;x-date, Signature=[0-9a-f]{64}$`
      )
    );
  });

  it('signs the body, so a changed request no longer verifies', () => {
    const sign = (body: string) =>
      signOpenApiRequest({
        method: 'POST',
        host: 'open.byteplusapi.com',
        query: { Action: 'StartVoiceChat', Version: '2025-05-01' },
        contentType: 'application/json',
        body,
        accessKeyId: 'AK',
        secretAccessKey: 'SK',
        region: 'ap-singapore-1',
        now: new Date('2026-09-28T12:00:00Z'),
      }).headers.Authorization;
    expect(sign('{"RoomId":"a"}')).not.toBe(sign('{"RoomId":"b"}'));
  });
});

describe('callVoiceChatApi', () => {
  const settings = () => {
    for (const [name, value] of Object.entries(VOICE_ENV)) vi.stubEnv(name, value);
    return voiceConfig();
  };
  const respond = (status: number, body: unknown) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

  afterEach(() => vi.unstubAllEnvs());

  it('posts a signed request to the current API version', async () => {
    const fetchMock = respond(200, { Result: 'success', ResponseMetadata: {} });
    await callVoiceChatApi('StopVoiceChat', { RoomId: 'r' }, settings());

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://open.byteplusapi.com/?Action=StopVoiceChat&Version=2025-05-01');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"RoomId":"r"}');
    expect((init?.headers as Record<string, string>).Authorization).toMatch(
      /^HMAC-SHA256 Credential=AKTEST\/\d{8}\/ap-singapore-1\/rtc\/request, /
    );
  });

  it('follows the host and region it is configured with', async () => {
    vi.stubEnv('BYTEPLUS_OPENAPI_URL', 'https://rtc.ap-southeast-1.byteplusapi.com/');
    vi.stubEnv('BYTEPLUS_OPENAPI_REGION', 'ap-southeast-1');
    const fetchMock = respond(200, { Result: 'success' });
    await callVoiceChatApi('StartVoiceChat', {}, settings());

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toMatch(/^https:\/\/rtc\.ap-southeast-1\.byteplusapi\.com\/\?Action=/);
    expect((init?.headers as Record<string, string>).Authorization).toContain('/ap-southeast-1/');
  });

  it('treats an error reported inside a 200 response as a failure', async () => {
    respond(200, {
      ResponseMetadata: {
        RequestId: 'req-1',
        Error: { Code: 'InvalidParameter', Message: 'bad room' },
      },
    });
    await expect(callVoiceChatApi('StartVoiceChat', {}, settings())).rejects.toMatchObject({
      code: 'InvalidParameter',
      requestId: 'req-1',
    });
  });

  it('fails on an HTTP error even when the body says nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 403 }));
    await expect(callVoiceChatApi('StartVoiceChat', {}, settings())).rejects.toBeInstanceOf(
      OpenApiError
    );
  });
});
