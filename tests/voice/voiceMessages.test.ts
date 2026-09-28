import { describe, expect, it } from 'vitest';
import { encodeVoiceAction, extractVoiceActions } from '../../src/utils/Voice';
import {
  type VoiceLine,
  type VoiceSubtitle,
  applySubtitle,
  decodeRoomMessage,
  encodeRoomMessage,
  readRoomEvent,
  typedMessage,
} from '../../src/utils/VoiceMessages';

const AGENT = 'agent_1';
const VISITOR = 'visitor_1';

const heard = (text: string, flags: Partial<VoiceSubtitle> = {}): VoiceSubtitle => ({
  userId: VISITOR,
  text,
  definite: false,
  paragraph: false,
  ...flags,
});
const said = (text: string, flags: Partial<VoiceSubtitle> = {}): VoiceSubtitle => ({
  ...heard(text, flags),
  userId: AGENT,
});
const fold = (subtitles: VoiceSubtitle[]) =>
  subtitles.reduce<VoiceLine[]>((lines, subtitle) => applySubtitle(lines, subtitle, AGENT), []);

describe('room messages', () => {
  it('uses the framing BytePlus documents: type, big-endian length, JSON', () => {
    const bytes = new Uint8Array(encodeRoomMessage('ctrl', { a: 1 }));
    expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe('ctrl');
    expect([...bytes.subarray(4, 8)]).toEqual([0, 0, 0, 7]);
    expect(new TextDecoder().decode(bytes.subarray(8))).toBe('{"a":1}');
  });

  it('round-trips text outside ASCII', () => {
    const message = encodeRoomMessage('subv', { text: 'quinceañera — ¿sí?' });
    expect(decodeRoomMessage(message)).toEqual({
      type: 'subv',
      body: { text: 'quinceañera — ¿sí?' },
    });
  });

  it.each([
    ['too short to hold a header', new Uint8Array([1, 2, 3]).buffer],
    ['a length longer than the message', new Uint8Array([99, 0, 0, 0, 0, 0, 0, 50, 1]).buffer],
    ['a body that is not JSON', new Uint8Array([99, 0, 0, 0, 0, 0, 0, 1, 123]).buffer],
  ])('ignores %s', (_case, buffer) => {
    expect(decodeRoomMessage(buffer as ArrayBuffer)).toBeNull();
  });
});

describe('readRoomEvent', () => {
  it.each([
    [1, 'listening'],
    [2, 'thinking'],
    [3, 'speaking'],
    [4, 'listening'],
    [5, 'listening'],
  ])('reads agent stage %i as %s', (Code, stage) => {
    const message = encodeRoomMessage('conv', { Stage: { Code, Description: '' } });
    expect(readRoomEvent(message)).toEqual({ kind: 'stage', stage });
  });

  it('reads a subtitle', () => {
    const message = encodeRoomMessage('subv', {
      data: [{ userId: VISITOR, text: 'hello', definite: true, paragraph: false, sequence: 3 }],
    });
    expect(readRoomEvent(message)).toEqual({
      kind: 'subtitle',
      subtitle: { userId: VISITOR, text: 'hello', definite: true, paragraph: false },
    });
  });

  it('ignores message types the widget has no use for', () => {
    expect(readRoomEvent(encodeRoomMessage('tool', { tool_calls: [] }))).toBeNull();
    expect(readRoomEvent(encodeRoomMessage('conv', { Stage: { Code: 42 } }))).toBeNull();
    expect(readRoomEvent(encodeRoomMessage('subv', { data: [] }))).toBeNull();
  });
});

describe('applySubtitle', () => {
  it('replaces the sentence being recognized instead of stacking its revisions', () => {
    const lines = fold([heard('do you'), heard('do you have'), heard('do you have June')]);
    expect(lines.map((line) => line.content)).toEqual(['do you have June']);
  });

  it('keeps finished sentences when the visitor carries on in the same turn', () => {
    const lines = fold([
      heard('Hi there.', { definite: true }),
      heard('is June'),
      heard('Is June open?', { definite: true, paragraph: true }),
    ]);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ content: 'Hi there. Is June open?', done: true });
  });

  it('appends the pieces of the agent reply, with the spaces the pipeline strips', () => {
    const lines = fold([said('June the 14th is open.'), said('Want to see the hall'), said('?')]);
    expect(lines[0]?.content).toBe('June the 14th is open. Want to see the hall?');
  });

  it('starts a new line when the other side speaks', () => {
    const lines = fold([
      heard('Is June open?', { definite: true, paragraph: true }),
      said('Yes it is.', { paragraph: true }),
      heard('Great', { definite: true, paragraph: true }),
    ]);
    expect(lines.map((line) => line.role)).toEqual(['user', 'assistant', 'user']);
  });

  it('starts a new line after an interruption left the agent mid-sentence', () => {
    const lines = fold([said('The hall holds up to'), heard('wait'), said('Sure.')]);
    expect(lines.map((line) => line.content)).toEqual(['The hall holds up to', 'wait', 'Sure.']);
  });

  it('skips the empty end-of-turn marker without losing the turn', () => {
    const lines = fold([said('All set.'), said('', { definite: true, paragraph: true })]);
    expect(lines).toEqual([
      expect.objectContaining({ role: 'assistant', content: 'All set.', done: true }),
    ]);
    expect(fold([said('', { paragraph: true })])).toEqual([]);
  });

  it('delivers an action tag that arrived across several subtitles', () => {
    const tag = encodeVoiceAction({ action: 'contact', channels: ['call'], whatsapp: {} });
    const lines = fold([said('One moment.'), said(tag.slice(0, 12)), said(tag.slice(12))]);
    expect(extractVoiceActions(lines[0]?.content ?? '')).toEqual({
      text: 'One moment.',
      actions: [{ action: 'contact', channels: ['call'], whatsapp: {} }],
    });
  });
});

describe('typedMessage', () => {
  const body = (text: string) => {
    const buffer = typedMessage(text);
    return buffer ? (decodeRoomMessage(buffer)?.body as Record<string, unknown>) : null;
  };

  it('sends what the visitor typed straight to the agent, cutting in on its speech', () => {
    expect(decodeRoomMessage(typedMessage('ana@example.com') as ArrayBuffer)).toEqual({
      type: 'ctrl',
      body: { Command: 'ExternalTextToLLM', Message: 'ana@example.com.', InterruptMode: 1 },
    });
  });

  it('leaves a message that already ends a sentence as it is', () => {
    expect(body('Is it free?')?.Message).toBe('Is it free?');
  });

  it('stays within the 200 characters BytePlus accepts, end punctuation included', () => {
    const message = body('x'.repeat(500))?.Message as string;
    expect(message).toHaveLength(200);
    expect(message.endsWith('.')).toBe(true);
  });

  it('sends nothing for an empty message', () => {
    expect(typedMessage('   ')).toBeNull();
  });
});
