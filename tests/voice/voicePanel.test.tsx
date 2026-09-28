// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import chat from '../../public/locales/en/chat.json';
import { encodeVoiceAction } from '../../src/utils/Voice';
import type { VoiceLine } from '../../src/utils/VoiceMessages';

vi.mock('next-i18next/pages', async () => await import('../helpers/i18n'));
vi.mock('next/router', () => ({ useRouter: () => ({ locale: 'en' }) }));

const call = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('../../src/hooks/UseVoiceCall', () => ({ useVoiceCall: () => call.current }));

const { VoicePanel } = await import('../../src/ui/features/VoicePanel');

const { voice } = chat;
const line = (role: VoiceLine['role'], content: string): VoiceLine => ({
  role,
  content,
  settled: content,
  done: true,
});

const show = (state: Record<string, unknown> = {}) => {
  call.current = {
    status: 'idle',
    stage: 'listening',
    error: null,
    endReason: 'hangUp',
    lines: [],
    muted: false,
    secondsLeft: 0,
    audioBlocked: false,
    start: vi.fn(),
    end: vi.fn(),
    toggleMute: vi.fn(),
    sendTyped: vi.fn(() => true),
    unblockAudio: vi.fn(),
    ...state,
  };
  const onBack = vi.fn();
  render(<VoicePanel onBack={onBack} />);
  return { onBack, call: call.current as Record<string, ReturnType<typeof vi.fn>> };
};

beforeEach(() => {
  Element.prototype.scrollTo = vi.fn();
});
afterEach(cleanup);

describe('VoicePanel — before the call', () => {
  it("says where the visitor's voice goes before asking for the microphone", () => {
    const { call } = show();
    expect(screen.getByText(voice.consent.body)).toBeTruthy();
    expect(voice.consent.body).toMatch(/BytePlus/);
    expect(voice.consent.body).toMatch(/outside the United States/);
    expect(call.start).not.toHaveBeenCalled();
  });

  it("starts the call only on the visitor's say-so", () => {
    const { call } = show();
    fireEvent.click(screen.getByRole('button', { name: voice.consent.accept }));
    expect(call.start).toHaveBeenCalledOnce();
  });

  it('goes back to the text chat when the visitor declines', () => {
    const { onBack, call } = show();
    fireEvent.click(screen.getByRole('button', { name: voice.consent.decline }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(call.start).not.toHaveBeenCalled();
  });

  it.each([
    ['requesting_mic', voice.status.requestingMic],
    ['connecting', voice.status.connecting],
  ])('shows progress and a way out while %s', (status, message) => {
    const { call } = show({ status });
    expect(screen.getByText(message)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: voice.end }));
    expect(call.end).toHaveBeenCalledOnce();
  });
});

describe('VoicePanel — during the call', () => {
  it.each([
    ['listening', false, voice.status.listening],
    ['thinking', false, voice.status.thinking],
    ['speaking', false, voice.status.speaking],
    ['speaking', true, voice.status.muted],
  ])('shows the agent %s (muted: %s) as "%s"', (stage, muted, label) => {
    show({ status: 'live', stage, muted, secondsLeft: 200 });
    expect(screen.getByText(label)).toBeTruthy();
  });

  it('shows the time left on the call', () => {
    show({ status: 'live', secondsLeft: 65 });
    expect(screen.getByText('1:05 left')).toBeTruthy();
  });

  it('shows the conversation, without the tags that carry the actions', () => {
    const booked = encodeVoiceAction({
      action: 'viewing_booked',
      start: '2026-10-10T14:30:00.000Z',
      email: 'ana@example.com',
    });
    show({
      status: 'live',
      secondsLeft: 200,
      lines: [
        line('user', 'Yes, book it'),
        line('assistant', `${booked} You are booked for Saturday.`),
      ],
    });

    expect(screen.getByText('Yes, book it')).toBeTruthy();
    expect(screen.getByText('You are booked for Saturday.')).toBeTruthy();
    expect(document.body.textContent).not.toContain('fx_');
    expect(screen.getByText(chat.booked.heading)).toBeTruthy();
    expect(document.body.textContent).toContain('ana@example.com');
    expect(document.body.textContent).toContain('10:30');
  });

  it('puts the contact buttons the agent offered under its reply', () => {
    const contact = encodeVoiceAction({
      action: 'contact',
      channels: ['call', 'whatsapp'],
      whatsapp: { guests: '150' },
    });
    show({
      status: 'live',
      secondsLeft: 200,
      lines: [line('assistant', `${contact} You can call or message us.`)],
    });

    expect(screen.getByRole('link', { name: chat.call }).getAttribute('href')).toMatch(/^tel:\+/);
    expect(screen.getByRole('link', { name: chat.whatsapp }).getAttribute('href')).toContain(
      'wa.me'
    );
    expect(screen.queryByRole('button', { name: chat.contactForm })).toBeNull();
  });

  it('sends what the visitor typed and clears the box', () => {
    const { call } = show({ status: 'live', secondsLeft: 200 });
    const box = screen.getByLabelText(voice.typed.label) as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: voice.typed.send }));

    expect(call.sendTyped).toHaveBeenCalledWith('ana@example.com');
    expect(box.value).toBe('');
  });

  it('keeps what was typed when it could not be sent', () => {
    show({ status: 'live', secondsLeft: 200, sendTyped: vi.fn(() => false) });
    const box = screen.getByLabelText(voice.typed.label) as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'ana@example.com' } });
    fireEvent.submit(box);
    expect(box.value).toBe('ana@example.com');
  });

  it('holds a typed answer to what BytePlus accepts', () => {
    show({ status: 'live', secondsLeft: 200 });
    const box = screen.getByLabelText(voice.typed.label) as HTMLInputElement;
    expect(box.maxLength).toBeLessThan(200);
  });

  it('mutes and hangs up', () => {
    const { call } = show({ status: 'live', secondsLeft: 200 });
    fireEvent.click(screen.getByRole('button', { name: voice.mute }));
    fireEvent.click(screen.getByRole('button', { name: voice.end }));
    expect(call.toggleMute).toHaveBeenCalledOnce();
    expect(call.end).toHaveBeenCalledOnce();
  });

  it('offers to unmute once muted', () => {
    show({ status: 'live', secondsLeft: 200, muted: true });
    expect(screen.getByRole('button', { name: voice.unmute }).getAttribute('aria-pressed')).toBe(
      'true'
    );
  });

  it('offers a tap to hear the agent only when the browser held the audio back', () => {
    show({ status: 'live', secondsLeft: 200 });
    expect(screen.queryByRole('button', { name: voice.unblockAudio })).toBeNull();
    cleanup();

    const { call } = show({ status: 'live', secondsLeft: 200, audioBlocked: true });
    fireEvent.click(screen.getByRole('button', { name: voice.unblockAudio }));
    expect(call.unblockAudio).toHaveBeenCalledOnce();
  });
});

describe('VoicePanel — after the call', () => {
  it('thanks the visitor and offers another call or the chat', () => {
    const { onBack, call } = show({ status: 'ended' });
    expect(screen.getByText(voice.ended.body)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: voice.ended.again }));
    fireEvent.click(screen.getByRole('button', { name: voice.back }));
    expect(call.start).toHaveBeenCalledOnce();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('explains a call that ran out of time', () => {
    show({ status: 'ended', endReason: 'timeUp' });
    expect(screen.getByText(voice.ended.timeUp)).toBeTruthy();
  });

  it.each(Object.entries(voice.errors))('explains the failure "%s"', (error, message) => {
    show({ status: 'error', error });
    expect(screen.getByRole('alert').textContent).toBe(message);
    expect(screen.getByRole('button', { name: voice.back })).toBeTruthy();
  });

  it.each([
    ['micDenied', true],
    ['failed', true],
    ['dropped', true],
    ['busy', false],
    ['rateLimited', false],
    ['unsupported', false],
    ['noMic', false],
  ])('after "%s", offers another try: %s', (error, retry) => {
    show({ status: 'error', error });
    expect(screen.queryByRole('button', { name: voice.ended.again }) !== null).toBe(retry);
  });

  it.each([
    ['busy', true],
    ['failed', true],
    ['dropped', true],
    ['micDenied', false],
    ['rateLimited', false],
  ])('after "%s", offers a person to reach: %s', (error, offered) => {
    show({ status: 'error', error });
    expect(screen.queryByRole('link', { name: chat.call }) !== null).toBe(offered);
  });
});
