import {
  ACCOUNT_CATALOG,
  ACCOUNT_RECORD_FIELDS,
  type AccountRecord,
  type AccountRow,
} from '../utils/AdminAccounts';

export type Directory = { rows: AccountRow[]; problem: string | null };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanRecord = (raw: unknown): AccountRecord => {
  if (!isObject(raw)) return {};
  const record: AccountRecord = {};
  for (const field of ACCOUNT_RECORD_FIELDS) {
    const value = raw[field];
    if (typeof value === 'string' && value.trim()) record[field] = value.trim();
  }
  return record;
};

export const loadDirectory = (raw = process.env.ADMIN_DIRECTORY_JSON): Directory => {
  let parsed: unknown = {};
  let problem: string | null = null;

  if (raw?.trim()) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      problem = 'ADMIN_DIRECTORY_JSON is not valid JSON, so no owners are shown.';
    }
    if (!problem && !isObject(parsed)) {
      problem = 'ADMIN_DIRECTORY_JSON must be an object keyed by account id.';
      parsed = {};
    }
  }

  const byId = parsed as Record<string, unknown>;
  return {
    rows: ACCOUNT_CATALOG.map((entry) => ({ ...entry, record: cleanRecord(byId[entry.id]) })),
    problem,
  };
};
