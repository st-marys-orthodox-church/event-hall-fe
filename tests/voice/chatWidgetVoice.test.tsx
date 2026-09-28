// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import chat from '../../public/locales/en/chat.json';

const router = vi.hoisted(() => ({ locale: 'en' }));
vi.mock('next-i18next/pages', async () => await import('../helpers/i18n'));
vi.mock('next/router', () => ({ useRouter: () => router }));
// The real one is fetched on demand; here it only has to show it was asked for.
vi.mock('next/dynamic', () => ({
  default: () =>
    function VoicePanelStandIn({ onBack }: { onBack: () => void }) {
      return (
        <button type="button" onClick={onBack}>
          call screen
        </button>
      );
    },
}));

const { ChatWidget } = await import('../../src/ui/features/ChatWidget');

const open = () => {
  render(<ChatWidget />);
  fireEvent.click(screen.getByRole('button', { name: chat.launcher }));
};
const talkButton = () => screen.queryByRole('button', { name: chat.voice.launch });

beforeEach(() => {
  router.locale = 'en';
  vi.stubEnv('NEXT_PUBLIC_VOICE_ENABLED', '1');
  Element.prototype.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});
afterEach(cleanup);

describe('ChatWidget — offering a voice call', () => {
  it('offers a call to an English visitor when voice is switched on', () => {
    open();
    expect(talkButton()).not.toBeNull();
  });

  it.each(['es', 'ro'])('keeps to the text chat in %s, where there is no voice yet', (locale) => {
    router.locale = locale;
    open();
    expect(talkButton()).toBeNull();
    expect(screen.getByLabelText(chat.inputLabel)).toBeTruthy();
  });

  it('offers no call while voice is switched off', () => {
    vi.stubEnv('NEXT_PUBLIC_VOICE_ENABLED', '');
    open();
    expect(talkButton()).toBeNull();
  });

  it('swaps the chat for the call screen, and back', () => {
    open();
    fireEvent.click(talkButton() as HTMLElement);

    expect(screen.getByText('call screen')).toBeTruthy();
    expect(screen.getByRole('heading', { name: chat.voice.title })).toBeTruthy();
    expect(screen.queryByLabelText(chat.inputLabel)).toBeNull();
    expect(talkButton()).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: chat.voice.back }));
    expect(screen.queryByText('call screen')).toBeNull();
    expect(screen.getByLabelText(chat.inputLabel)).toBeTruthy();
  });

  it('comes back to the chat, not to a call, after the widget was closed mid-call', () => {
    open();
    fireEvent.click(talkButton() as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: chat.close }));
    fireEvent.click(screen.getByRole('button', { name: chat.launcher }));

    expect(screen.queryByText('call screen')).toBeNull();
    expect(screen.getByLabelText(chat.inputLabel)).toBeTruthy();
  });
});
