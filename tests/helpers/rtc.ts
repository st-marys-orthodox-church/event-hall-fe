import { vi } from 'vitest';
import { encodeRoomMessage } from '../../src/utils/VoiceMessages';

type Listener = (event: never) => void;

/** The parts of the RTC SDK a call touches, with the room events fired by hand. */
export const fakeRtc = () => {
  const listeners = new Map<string, Listener[]>();
  const engine = {
    on: vi.fn((event: string, listener: Listener) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    }),
    joinRoom: vi.fn(async () => {}),
    leaveRoom: vi.fn(async () => {}),
    startAudioCapture: vi.fn(async () => ({})),
    stopAudioCapture: vi.fn(async () => {}),
    publishStream: vi.fn(async (_mediaType: number) => {}),
    unpublishStream: vi.fn(async (_mediaType: number) => {}),
    sendUserBinaryMessage: vi.fn(async (_userId: string, _message: ArrayBuffer) => {}),
    play: vi.fn(async (_userId: string) => {}),
  };
  const rtc = {
    isSupported: vi.fn(async () => true),
    enableDevices: vi.fn(async () => ({ audio: true, video: false })),
    createEngine: vi.fn(() => engine),
    destroyEngine: vi.fn(),
    events: new Proxy({}, { get: (_target, name) => name }) as Record<string, string>,
  };
  const fire = (event: string, payload: unknown) => {
    for (const listener of listeners.get(event) ?? []) listener(payload as never);
  };
  return {
    engine,
    rtc,
    module: { default: rtc, MediaType: { AUDIO: 1 }, RoomProfileType: { chat: 5 } },
    fire,
    /** A message from the agent, as it arrives through the room. */
    receive: (type: string, body: unknown) =>
      fire('onRoomBinaryMessageReceived', {
        userId: 'agent_1',
        message: encodeRoomMessage(type, body),
      }),
  };
};

export const CALL = {
  appId: '0123456789abcdef01234567',
  roomId: 'hall_1',
  userId: 'visitor_1',
  agentUserId: 'agent_1',
  token: 'room-token',
  session: 'sealed.session',
  maxSeconds: 360,
};
