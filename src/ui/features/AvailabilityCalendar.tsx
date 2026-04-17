import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';

const VENUE_TZ = 'America/New_York';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Props = {
  monthsVisible?: number;
  onDateSelect?: (date: Date) => void;
  className?: string;
};

type MonthKey = { year: number; month: number };

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

const todayIsoInVenueTz = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: VENUE_TZ }).format(new Date());

const addMonths = ({ year, month }: MonthKey, n: number): MonthKey => {
  const total = year * 12 + month + n;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
};

const isoToMonthKey = (iso: string): MonthKey => {
  const parts = iso.split('-');
  return { year: Number(parts[0]), month: Number(parts[1]) - 1 };
};

const buildMonthCells = (year: number, month: number) => {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

async function fetchAvailability(from: string, to: string): Promise<string[]> {
  const res = await fetch(`/api/availability/?from=${from}&to=${to}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`availability request failed: ${res.status}`);
  const data = (await res.json()) as { dates?: string[] };
  return data.dates ?? [];
}

const DayCell = ({
  day,
  year,
  month,
  status,
  onSelect,
}: {
  day: number | null;
  year: number;
  month: number;
  status: 'available' | 'booked' | 'past' | null;
  onSelect: (date: Date) => void;
}) => {
  if (day === null || status === null) {
    return <div aria-hidden className="aspect-square" />;
  }

  const label = `${MONTH_NAMES[month]} ${day}, ${year}, ${status}`;

  if (status === 'past') {
    return (
      <div
        aria-label={label}
        className="aspect-square flex items-center justify-center rounded-lg text-stone-300 text-sm select-none"
      >
        {day}
      </div>
    );
  }

  if (status === 'booked') {
    return (
      <div
        aria-label={label}
        title="Booked"
        className="aspect-square flex flex-col items-center justify-center rounded-lg bg-brand-green/15 ring-1 ring-brand-green/30 text-brand-green-deep select-none"
      >
        <span className="text-sm font-semibold leading-none">{day}</span>
        <span className="text-[9px] uppercase tracking-wider mt-0.5 font-medium">Booked</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${MONTH_NAMES[month]} ${day}, ${year}, available — select date to inquire`}
      onClick={() => onSelect(new Date(year, month, day))}
      className="aspect-square flex items-center justify-center rounded-lg text-sm text-stone-700 font-medium bg-white hover:bg-brand-gold/15 hover:text-brand-gold-deep hover:ring-1 hover:ring-brand-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition cursor-pointer"
    >
      {day}
    </button>
  );
};

const MonthGrid = ({
  year,
  month,
  bookedSet,
  todayIso,
  onSelect,
}: {
  year: number;
  month: number;
  bookedSet: Set<string>;
  todayIso: string;
  onSelect: (date: Date) => void;
}) => {
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5">
      <h3 className="text-center text-lg font-bold text-stone-800 mb-4">
        {MONTH_NAMES[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-500 text-center font-semibold py-1"
          >
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <DayCell
                key={idx}
                day={null}
                year={year}
                month={month}
                status={null}
                onSelect={onSelect}
              />
            );
          }
          const iso = isoOf(year, month, day);
          let status: 'available' | 'booked' | 'past';
          if (iso < todayIso) status = 'past';
          else if (bookedSet.has(iso)) status = 'booked';
          else status = 'available';
          return (
            <DayCell
              key={idx}
              day={day}
              year={year}
              month={month}
              status={status}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

const Legend = () => (
  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-stone-600 mt-6">
    <span className="flex items-center gap-2">
      <span className="inline-block w-4 h-4 rounded bg-white border border-stone-300" />
      Available
    </span>
    <span className="flex items-center gap-2">
      <span className="inline-block w-4 h-4 rounded bg-brand-green/15 ring-1 ring-brand-green/30" />
      Booked
    </span>
    <span className="flex items-center gap-2">
      <span className="inline-block w-4 h-4 rounded border border-stone-200 text-stone-300 flex items-center justify-center text-[10px]">
        •
      </span>
      Past
    </span>
  </div>
);

const SkeletonGrid = () => (
  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 animate-pulse">
    <div className="h-6 w-32 bg-stone-200 rounded mx-auto mb-4" />
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 42 }).map((_, i) => (
        <div key={i} className="aspect-square bg-stone-100 rounded-lg" />
      ))}
    </div>
  </div>
);

const AvailabilityCalendar = ({ monthsVisible = 2, onDateSelect, className }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [baseMonth, setBaseMonth] = useState<MonthKey>({ year: 2026, month: 0 });
  const [todayIso, setTodayIso] = useState('');
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const iso = todayIsoInVenueTz();
    setTodayIso(iso);
    setBaseMonth(isoToMonthKey(iso));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const from = `${baseMonth.year}-${pad(baseMonth.month + 1)}-01`;
    const last = addMonths(baseMonth, monthsVisible);
    const to = `${last.year}-${pad(last.month + 1)}-01`;

    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchAvailability(from, to)
      .then((dates) => {
        if (!cancelled) {
          setBookedSet(new Set(dates));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, baseMonth, monthsVisible]);

  const handleSelect = (date: Date) => {
    if (onDateSelect) onDateSelect(date);
  };

  const goPrev = () => setBaseMonth((m) => addMonths(m, -1));
  const goNext = () => setBaseMonth((m) => addMonths(m, 1));

  const atCurrentMonth =
    mounted &&
    todayIso &&
    baseMonth.year * 12 + baseMonth.month <=
      Number.parseInt(todayIso.slice(0, 4), 10) * 12 +
        Number.parseInt(todayIso.slice(5, 7), 10) -
        1;

  const visibleMonths = useMemo(
    () => Array.from({ length: monthsVisible }, (_, i) => addMonths(baseMonth, i)),
    [baseMonth, monthsVisible]
  );

  if (!mounted) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <SkeletonGrid />
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={goPrev}
          disabled={Boolean(atCurrentMonth)}
          aria-label="Previous month"
          className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-stone-700 disabled:hover:border-stone-300"
        >
          <ChevronLeft />
        </button>
        <p className="text-sm text-stone-500 font-medium">Click any available date to start</p>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition"
        >
          <ChevronRight />
        </button>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
          <p className="text-stone-700 font-semibold mb-2">Calendar temporarily unavailable</p>
          <p className="text-stone-600 text-sm">
            Please call us or submit the contact form to check availability.
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {visibleMonths.map((m) => (
            <SkeletonGrid key={`${m.year}-${m.month}`} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {visibleMonths.map((m) => (
            <MonthGrid
              key={`${m.year}-${m.month}`}
              year={m.year}
              month={m.month}
              bookedSet={bookedSet}
              todayIso={todayIso}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <Legend />
    </div>
  );
};

export { AvailabilityCalendar };
