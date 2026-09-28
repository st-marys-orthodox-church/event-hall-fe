// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import viewing from '../public/locales/en/viewing.json';
import type { ViewingPrefill } from '../src/utils/Viewings';

vi.mock('next-i18next/pages', async () => await import('./helpers/i18n'));
vi.mock('next/router', () => ({ useRouter: () => ({ locale: 'en' }) }));
vi.mock('../src/utils/Analytics', () => ({ trackEvent: vi.fn() }));

const store = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('../src/stores/Global', () => ({ useAppContext: () => store.current }));

const { ViewingModal } = await import('../src/ui/modals/Viewing');

const SLOT = '2026-10-07T14:00:00.000Z';
const requests: string[] = [];
let bookingReply: { error: string } = { error: '' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const open = (prefill: ViewingPrefill | null = null) => {
  store.current = {
    viewingOpen: true,
    viewingPrefill: prefill,
    handleCloseViewing: vi.fn(),
    handleOpenModal: vi.fn(),
  };
  render(<ViewingModal />);
};

const day = (name: RegExp) => screen.findByRole('button', { name });
const continueButton = () =>
  screen.getByRole('button', { name: viewing.modal.continue }) as HTMLButtonElement;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-28T16:00:00Z'));
  requests.length = 0;
  bookingReply = { error: '' };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requests.push(url);
      if (url.startsWith('/api/availability')) {
        return json({
          dates: ['2026-09-30', '2026-12-19'],
          events: [{ id: 'festival', title: 'Festival', dates: ['2026-09-29'] }],
          eventsConfigured: true,
        });
      }
      if (url.startsWith('/api/viewings/slots')) {
        return json({ days: [{ date: '2026-10-07', slots: [SLOT] }] });
      }
      return json(bookingReply);
    })
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ViewingModal — choosing the event date', () => {
  it('opens on the calendar and asks nothing else until a date is chosen', async () => {
    open();
    expect(screen.getByText(viewing.date.heading)).toBeTruthy();
    expect(screen.getByText(/Step 1 of 4/)).toBeTruthy();
    await day(/^September 28, 2026, Available$/);
    expect(screen.queryByLabelText(viewing.qualify.guests)).toBeNull();
    expect(continueButton().disabled).toBe(true);
  });

  it('offers no way to choose a booked day, a church event day or a past day', async () => {
    open();
    await day(/^September 28, 2026, Available$/);
    for (const label of [
      'September 30, 2026, Booked',
      'September 29, 2026, Church event',
      'September 27, 2026, Past',
    ]) {
      expect(screen.getByLabelText(label).tagName).not.toBe('BUTTON');
    }
  });

  it('carries the chosen date through to the booking', async () => {
    open();
    fireEvent.click(await day(/^September 28, 2026, Available$/));
    expect(screen.getByText(/Step 2 of 4/)).toBeTruthy();
    expect(screen.getByText('Your event date: Monday, September 28, 2026')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(viewing.qualify.guests), { target: { value: '120' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(continueButton());

    fireEvent.click(await screen.findByRole('button', { name: '10:00 AM' }));
    fireEvent.click(continueButton());

    fireEvent.change(screen.getByLabelText(viewing.details.name), { target: { value: 'Ana Pop' } });
    fireEvent.change(screen.getByLabelText(viewing.details.email), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText(viewing.details.phone), {
      target: { value: '404 555 0100' },
    });
    fireEvent.click(screen.getByRole('button', { name: viewing.details.confirm }));

    await screen.findByText(viewing.success.heading);
    const call = vi
      .mocked(fetch)
      .mock.calls.find(([url]) => String(url).startsWith('/api/viewings/book'));
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({
      eventDate: '2026-09-28',
      guests: 120,
      slot: SLOT,
    });
  });

  it('turns away a booked date handed over by the chat and opens on its month', async () => {
    open({ eventDate: '2026-12-19', guests: 80 });
    await screen.findByText(viewing.qualify.dateBooked);
    expect(screen.getByLabelText('December 19, 2026, Booked').tagName).not.toBe('BUTTON');
    expect(continueButton().disabled).toBe(true);
    expect(requests.at(-1)).toContain('from=2026-12-01&to=2027-01-01');
  });

  it('keeps the chosen date when the visitor goes back to the calendar', async () => {
    open();
    fireEvent.click(await day(/^September 28, 2026, Available$/));
    fireEvent.click(screen.getByRole('button', { name: viewing.modal.back }));
    const chosen = await day(/^September 28, 2026, Available$/);
    expect(chosen.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(continueButton());
    expect(screen.getByText(/Step 2 of 4/)).toBeTruthy();
  });

  it('keeps the buttons and the ways to reach a person on screen at every step', async () => {
    open();
    const footerHas = (name: string) =>
      screen.getByRole('button', { name }).closest('[data-viewing-footer]') !== null;
    expect(footerHas(viewing.modal.continue)).toBe(true);
    expect(
      screen.getByText(/Prefer to talk to a person/).closest('[data-viewing-footer]')
    ).not.toBe(null);
    fireEvent.click(await day(/^September 28, 2026, Available$/));
    expect(footerHas(viewing.modal.continue)).toBe(true);
    expect(footerHas(viewing.modal.back)).toBe(true);
  });

  it('keeps an open date handed over by the chat selected', async () => {
    open({ eventDate: '2026-12-12' });
    const chosen = await day(/^December 12, 2026, Available$/);
    expect(chosen.getAttribute('aria-pressed')).toBe('true');
    expect(continueButton().disabled).toBe(false);
  });

  it('comes back to the calendar when the server finds the date was booked meanwhile', async () => {
    bookingReply = { error: 'date_booked' };
    open();
    fireEvent.click(await day(/^September 28, 2026, Available$/));
    fireEvent.change(screen.getByLabelText(viewing.qualify.guests), { target: { value: '120' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(continueButton());
    fireEvent.click(await screen.findByRole('button', { name: '10:00 AM' }));
    fireEvent.click(continueButton());
    fireEvent.change(screen.getByLabelText(viewing.details.name), { target: { value: 'Ana Pop' } });
    fireEvent.change(screen.getByLabelText(viewing.details.email), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText(viewing.details.phone), {
      target: { value: '404 555 0100' },
    });
    fireEvent.click(screen.getByRole('button', { name: viewing.details.confirm }));

    await screen.findByText(viewing.qualify.dateBooked);
    expect(screen.getByText(viewing.date.heading)).toBeTruthy();
    await waitFor(() => expect(continueButton().disabled).toBe(true));
  });
});
