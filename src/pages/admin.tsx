import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { isAdminConfigured, isAdminRequest } from '../server/adminAuth';
import { loadDirectory } from '../server/adminDirectory';
import { Meta } from '../ui/base/Meta';
import { ACCOUNT_CATALOG, type AccountRow } from '../utils/AdminAccounts';
import { LISTING_DETAILS, type ListingDetail, SOPS, type Sop } from '../utils/AdminSops';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

type Props =
  | { authed: false; failed: 'wrong' | 'limit' | null }
  | {
      authed: true;
      rows: AccountRow[];
      problem: string | null;
      sops: Sop[];
      listing: ListingDetail[];
    };

const CATEGORIES = [...new Set(ACCOUNT_CATALOG.map((entry) => entry.category))];

const FIELD_LABELS = [
  ['loginEmail', 'Login email'],
  ['credentialsIn', 'Password is in'],
  ['twoFactor', 'Two-step codes go to'],
  ['reviewedOn', 'Reviewed on'],
  ['notes', 'Notes'],
] as const;

const Login = ({ failed }: { failed: 'wrong' | 'limit' | null }) => (
  <main className="min-h-screen flex items-center justify-center px-4">
    <form
      method="post"
      action="/api/admin/login/"
      className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 p-8 shadow-sm"
    >
      <h1 className="font-display text-3xl text-stone-900">Team hub</h1>
      <p className="mt-2 text-sm text-stone-600">
        Fellowship Event Hall accounts and how-tos. Ask a teammate for the passcode.
      </p>
      <label htmlFor="passcode" className="mt-6 block text-sm font-medium text-stone-700">
        Passcode
      </label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        autoComplete="current-password"
        required
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
      {failed && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {failed === 'limit'
            ? 'Too many attempts. Try again in a few minutes.'
            : 'That passcode is not right.'}
        </p>
      )}
      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-brand-green px-4 py-2.5 font-medium text-white hover:opacity-90"
      >
        Open
      </button>
    </form>
  </main>
);

const Unassigned = () => (
  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
    Unassigned
  </span>
);

const AccountCard = ({ row }: { row: AccountRow }) => {
  const { record } = row;
  const sameOwner = record.owner && record.owner === record.backupOwner;
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium text-stone-900">
          {row.url ? (
            <a
              href={row.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-brand-gold underline-offset-4"
            >
              {row.name}
            </a>
          ) : (
            row.name
          )}
        </h3>
        <p className="text-sm text-stone-500">{row.purpose}</p>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Owner</dt>
          <dd className="text-stone-900">{record.owner ?? <Unassigned />}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Backup owner</dt>
          <dd className="text-stone-900">
            {record.backupOwner ?? <Unassigned />}
            {sameOwner && <span className="ml-2 text-xs text-amber-800">Same person as owner</span>}
          </dd>
        </div>
        {FIELD_LABELS.map(([field, label]) =>
          record[field] ? (
            <div key={field}>
              <dt className="text-stone-500">{label}</dt>
              <dd className="text-stone-900 break-words">{record[field]}</dd>
            </div>
          ) : null
        )}
      </dl>
    </li>
  );
};

const Hub = ({ rows, problem, sops, listing }: Extract<Props, { authed: true }>) => {
  const gaps = rows.filter((row) => !row.record.owner || !row.record.backupOwner).length;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-stone-900">Team hub</h1>
          <p className="mt-2 text-stone-600">
            Who owns each account, and how we do the recurring jobs. Passwords are never kept here.
          </p>
        </div>
        <form method="post" action="/api/admin/logout/">
          <button type="submit" className="text-sm text-stone-600 underline">
            Sign out
          </button>
        </form>
      </header>

      <nav className="mt-6 flex gap-4 text-sm">
        <a href="#accounts" className="underline">
          Accounts
        </a>
        <a href="#listing" className="underline">
          Listing details
        </a>
        <a href="#sops" className="underline">
          How-tos
        </a>
      </nav>

      <section id="accounts" className="mt-10">
        <h2 className="font-display text-2xl text-stone-900">Accounts</h2>
        {problem && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {problem}
          </p>
        )}
        {gaps > 0 && !problem && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {gaps} of {rows.length} accounts still need an owner or a backup owner.
          </p>
        )}
        {CATEGORIES.map((category) => (
          <div key={category} className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              {category}
            </h3>
            <ul className="mt-3 space-y-3">
              {rows
                .filter((row) => row.category === category)
                .map((row) => (
                  <AccountCard key={row.id} row={row} />
                ))}
            </ul>
          </div>
        ))}
        <p className="mt-6 text-sm text-stone-500">
          To change who owns an account, edit ADMIN_DIRECTORY_JSON in Vercel and redeploy. The
          format is in .env.sample.
        </p>
      </section>

      <section id="listing" className="mt-14">
        <h2 className="font-display text-2xl text-stone-900">Listing details</h2>
        <p className="mt-2 text-stone-600">
          The one correct version. Google, Yelp, Facebook and Instagram must all match it exactly.
        </p>
        <dl className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {listing.map((item) => (
            <div key={item.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm text-stone-500">{item.label}</dt>
              <dd className="text-stone-900 select-all">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="sops" className="mt-14">
        <h2 className="font-display text-2xl text-stone-900">How-tos</h2>
        <div className="mt-4 space-y-3">
          {sops.map((sop) => (
            <details key={sop.id} className="group rounded-xl border border-stone-200 bg-white p-5">
              <summary className="cursor-pointer font-medium text-stone-900">{sop.title}</summary>
              <p className="mt-3 text-sm text-stone-500">When: {sop.when}</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-800">
                {sop.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {sop.watchOut && (
                <div className="mt-4 rounded-lg bg-stone-50 p-4 text-sm text-stone-700">
                  <p className="font-medium">Watch out</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {sop.watchOut.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </details>
          ))}
        </div>
      </section>
    </main>
  );
};

const AdminPage = (props: Props) => (
  <div className="antialiased text-stone-800 bg-stone-50 min-h-screen">
    <Meta title="Team hub" description="Internal team page." noindex />
    {props.authed ? <Hub {...props} /> : <Login failed={props.failed} />}
  </div>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  locale,
  query,
}) => {
  if (!isAdminConfigured()) return { notFound: true };
  if (locale && locale !== I18N_DEFAULT_LOCALE) {
    return { redirect: { destination: '/admin/', permanent: false } };
  }

  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const i18n = await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
    'common',
    'seo',
    'contact',
    'viewing',
    'chat',
  ]);

  if (!isAdminRequest(req)) {
    const failed = query.error === 'limit' ? 'limit' : query.error ? 'wrong' : null;
    return { props: { ...i18n, authed: false, failed } };
  }

  const { rows, problem } = loadDirectory();
  return {
    props: { ...i18n, authed: true, rows, problem, sops: SOPS, listing: LISTING_DETAILS },
  };
};

export default AdminPage;
