// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeRoomMessage } from '../../src/utils/VoiceMessages';
import { CALL, fakeRtc } from '../helpers/rtc';

const sdk = vi.hoisted(() => ({ current: undefined as ReturnType<typeof fakeRtc> | undefined }));
vi.mock('@byteplus/rtc', () => ({
  get default() {
    return sdk.current?.module.default;
  },
  MediaType: { AUDIO: 1 },
  RoomProfileType: { chat: 5 },
}));

const { useVoiceCall } = await import('../../src/hooks/UseVoiceCall');

const honeypot = () => ({ website: '', fillTime: 4000 });

type Reply = { status: number; body: unknown };
let replies: Record<string, Reply>;
let fetchMock: ReturnType<typeof vi.fn>;
let beacon: ReturnType<typeof vi.fn>;

const requests = (path: string) =>
  fetchMock.mock.calls.filter(([url]) => String(url).startsWith(path));
const sentBody = (path: string) => JSON.parse(String(requests(path)[0]?.[1]?.body));

const startCall = async () => {
  const view = renderHook(() => useVoiceCall(honeypot));
  await act(() => view.result.current.start());
  return view;
};

beforeEach(() => {
  sdk.current = fakeRtc();
  replies = {
    '/api/voice/start/': { status: 200, body: CALL },
    '/api/voice/stop/': { status: 200, body: { ok: true } },
  };
  fetchMock = vi.fn(async (url: string) => {
    const reply = replies[url] ?? { status: 404, body: {} };
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  });
  vi.stubGlobal('fetch', fetchMock);
  beacon = vi.fn(() => true);
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { enumerateDevices: async () => [{ kind: 'audioinput' }] },
    configurable: true,
  });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  // Unmounts the hooks of the test that just ran, which also hangs up their calls.
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useVoiceCall — getting connected', () => {
  it('asks for the microphone, starts the agent, then joins the room it was given', async () => {
    const { result } = await startCall();
    const { rtc, engine } = sdk.current as ReturnType<typeof fakeRtc>;

    expect(result.current.status).toBe('live');
    expect(rtc.enableDevices).toHaveBeenCalledWith({ audio: true, video: false });
    expect(sentBody('/api/voice/start/')).toMatchObject({
      locale: 'en',
      consent: true,
      website: '',
      fillTime: 4000,
    });
    expect(rtc.createEngine).toHaveBeenCalledWith(CALL.appId);
    expect(engine.joinRoom).toHaveBeenCalledWith(
      CALL.token,
      CALL.roomId,
      { userId: CALL.userId },
      expect.objectContaining({ isAutoPublish: true, isAutoSubscribeAudio: true })
    );
    expect(engine.startAudioCapture).toHaveBeenCalled();
    expect(result.current.secondsLeft).toBe(360);

    const order = [
      rtc.enableDevices.mock.invocationCallOrder[0],
      fetchMock.mock.invocationCallOrder[0],
      engine.joinRoom.mock.invocationCallOrder[0],
    ];
    expect(order).toEqual([...order].sort((a, b) => Number(a) - Number(b)));
  });

  it.each([
    ['the microphone was refused', [{ kind: 'audioinput' }], 'micDenied'],
    ['there is no microphone', [{ kind: 'audiooutput' }], 'noMic'],
  ])('starts no call, and so no billing, when %s', async (_case, devices, error) => {
    sdk.current?.rtc.enableDevices.mockResolvedValue({ audio: false, video: false });
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { enumerateDevices: async () => devices },
      configurable: true,
    });
    const { result } = await startCall();

    expect(result.current).toMatchObject({ status: 'error', error });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('says so when the browser cannot do calls at all', async () => {
    sdk.current?.rtc.isSupported.mockResolvedValue(false);
    const { result } = await startCall();
    expect(result.current).toMatchObject({ status: 'error', error: 'unsupported' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [429, 'rate_limited', 'rateLimited'],
    [503, 'busy', 'busy'],
    [502, 'failed', 'failed'],
    [503, 'not_configured', 'failed'],
    [500, undefined, 'failed'],
  ])('reads a %i %s from the server as "%s"', async (status, code, error) => {
    replies['/api/voice/start/'] = { status, body: { error: code } };
    const { result } = await startCall();

    expect(result.current).toMatchObject({ status: 'error', error });
    expect(sdk.current?.rtc.createEngine).not.toHaveBeenCalled();
    expect(requests('/api/voice/stop/')).toHaveLength(0);
  });

  it('stops the agent it started when the room cannot be joined', async () => {
    sdk.current?.engine.joinRoom.mockRejectedValue(new Error('token_error'));
    const { result } = await startCall();

    expect(result.current).toMatchObject({ status: 'error', error: 'failed' });
    expect(sentBody('/api/voice/stop/')).toEqual({ session: CALL.session });
    expect(sdk.current?.rtc.destroyEngine).toHaveBeenCalled();
  });

  it('stops the agent when the visitor gives up while still connecting', async () => {
    let answer = (_response: Response) => {};
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          answer = resolve;
        })
    );
    const { result } = renderHook(() => useVoiceCall(honeypot));
    let starting = Promise.resolve();
    act(() => {
      starting = result.current.start();
    });
    await waitFor(() => expect(result.current.status).toBe('connecting'));

    act(() => result.current.end());
    await act(async () => {
      answer(new Response(JSON.stringify(CALL), { status: 200 }));
      await starting;
    });

    expect(result.current.status).toBe('ended');
    expect(sdk.current?.engine.joinRoom).not.toHaveBeenCalled();
    expect(sentBody('/api/voice/stop/')).toEqual({ session: CALL.session });
  });
});

describe('useVoiceCall — during the call', () => {
  it('follows what the agent is doing', async () => {
    const { result } = await startCall();
    for (const [Code, stage] of [
      [2, 'thinking'],
      [3, 'speaking'],
      [5, 'listening'],
    ] as const) {
      act(() => sdk.current?.receive('conv', { Stage: { Code } }));
      expect(result.current.stage).toBe(stage);
    }
  });

  it('writes both sides of the conversation down as it happens', async () => {
    const { result } = await startCall();
    const say = (userId: string, text: string, paragraph = false) =>
      act(() =>
        sdk.current?.receive('subv', { data: [{ userId, text, definite: true, paragraph }] })
      );
    say(CALL.userId, 'Is June open?', true);
    say(CALL.agentUserId, 'Yes,');
    say(CALL.agentUserId, 'June the 14th is open.', true);

    expect(result.current.lines.map(({ role, content }) => [role, content])).toEqual([
      ['user', 'Is June open?'],
      ['assistant', 'Yes, June the 14th is open.'],
    ]);
  });

  it('sends a typed answer to the agent and shows it in the conversation', async () => {
    const { result } = await startCall();
    let sent = false;
    act(() => {
      sent = result.current.sendTyped('  ana@example.com ');
    });

    expect(sent).toBe(true);
    const sentToAgent = sdk.current?.engine.sendUserBinaryMessage.mock.calls[0];
    expect(sentToAgent?.[0]).toBe(CALL.agentUserId);
    expect(decodeRoomMessage(sentToAgent?.[1] as ArrayBuffer)?.body).toMatchObject({
      Command: 'ExternalTextToLLM',
      Message: 'ana@example.com.',
    });
    expect(result.current.lines.at(-1)).toMatchObject({
      role: 'user',
      content: 'ana@example.com',
    });
  });

  it('sends nothing typed when there is nothing to send, or no call to send it to', async () => {
    const { result } = await startCall();
    expect(result.current.sendTyped('   ')).toBe(false);
    act(() => result.current.end());
    expect(result.current.sendTyped('hello')).toBe(false);
    expect(sdk.current?.engine.sendUserBinaryMessage).not.toHaveBeenCalled();
  });

  it('mutes by no longer sending the microphone, and unmutes by sending it again', async () => {
    const { result } = await startCall();
    await act(() => result.current.toggleMute());
    expect(result.current.muted).toBe(true);
    expect(sdk.current?.engine.unpublishStream).toHaveBeenCalledWith(1);

    await act(() => result.current.toggleMute());
    expect(result.current.muted).toBe(false);
    expect(sdk.current?.engine.publishStream).toHaveBeenCalledWith(1);
  });

  it('offers a tap to hear the agent when the browser held its audio back', async () => {
    const { result } = await startCall();
    act(() => sdk.current?.fire('onAutoplayFailed', { userId: CALL.agentUserId, kind: 'audio' }));
    expect(result.current.audioBlocked).toBe(true);

    await act(async () => result.current.unblockAudio());
    expect(sdk.current?.engine.play).toHaveBeenCalledWith(CALL.agentUserId);
    await waitFor(() => expect(result.current.audioBlocked).toBe(false));
  });
});

describe('useVoiceCall — hanging up', () => {
  it('stops the agent and leaves the room when the visitor hangs up', async () => {
    const { result } = await startCall();
    await act(async () => result.current.end());

    expect(result.current).toMatchObject({ status: 'ended', endReason: 'hangUp' });
    expect(sentBody('/api/voice/stop/')).toEqual({ session: CALL.session });
    expect(requests('/api/voice/stop/')[0]?.[1]).toMatchObject({ keepalive: true });
    expect(sdk.current?.engine.leaveRoom).toHaveBeenCalled();
    expect(sdk.current?.rtc.destroyEngine).toHaveBeenCalled();
  });

  it('counts down and ends the call when its time is up', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const { result } = await startCall();

    await act(async () => vi.advanceTimersByTime(60_000));
    expect(result.current.secondsLeft).toBe(300);
    expect(result.current.status).toBe('live');

    await act(async () => vi.advanceTimersByTime(300_000));
    expect(result.current).toMatchObject({ status: 'ended', endReason: 'timeUp' });
    expect(requests('/api/voice/stop/')).toHaveLength(1);
  });

  it('ends the call as out of time when the room token expires first', async () => {
    const { result } = await startCall();
    act(() => sdk.current?.fire('onError', { errorCode: 'TOKEN_EXPIRED' }));
    expect(result.current).toMatchObject({ status: 'ended', endReason: 'timeUp' });
  });

  it.each([
    ['the agent leaves the room', 'onUserLeave', { userInfo: { userId: CALL.agentUserId } }],
    ['the connection is lost', 'onError', { errorCode: 'RECONNECT_FAILED' }],
  ])('reports the call as cut off when %s', async (_case, event, payload) => {
    const { result } = await startCall();
    act(() => sdk.current?.fire(event, payload));

    expect(result.current).toMatchObject({ status: 'error', error: 'dropped' });
    expect(requests('/api/voice/stop/')).toHaveLength(1);
  });

  it('is not cut off by someone else leaving the room', async () => {
    const { result } = await startCall();
    act(() => sdk.current?.fire('onUserLeave', { userInfo: { userId: 'someone_else' } }));
    expect(result.current.status).toBe('live');
  });

  it('stops the agent when the widget goes away mid-call', async () => {
    const { unmount } = await startCall();
    unmount();
    expect(sentBody('/api/voice/stop/')).toEqual({ session: CALL.session });
  });

  it('stops the agent with a beacon when the page itself is closing', async () => {
    await startCall();
    window.dispatchEvent(new Event('pagehide'));

    expect(beacon).toHaveBeenCalledOnce();
    const [url, blob] = beacon.mock.calls[0] ?? [];
    expect(url).toBe('/api/voice/stop/');
    expect(JSON.parse(await (blob as Blob).text())).toEqual({ session: CALL.session });
  });

  it('sends no stop, by beacon or otherwise, when there is no call', async () => {
    const { unmount } = renderHook(() => useVoiceCall(honeypot));
    window.dispatchEvent(new Event('pagehide'));
    unmount();
    expect(beacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('starts clean when the visitor calls again', async () => {
    const { result } = await startCall();
    act(() =>
      sdk.current?.receive('subv', {
        data: [{ userId: CALL.userId, text: 'Hello', definite: true, paragraph: true }],
      })
    );
    await act(async () => result.current.end());
    await act(() => result.current.start());

    expect(result.current).toMatchObject({ status: 'live', lines: [], muted: false });
    expect(requests('/api/voice/start/')).toHaveLength(2);
    expect(requests('/api/voice/stop/')).toHaveLength(1);
  });
});
