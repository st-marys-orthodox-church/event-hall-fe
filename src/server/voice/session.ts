import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { LEAD_SOURCE_KEYS, type LeadSource } from '../../utils/LeadSource';

// The session rides in a request header on every turn of the call, so it is kept small.
const LEAD_FIELD_MAX = 150;

export type VoiceSession = {
  roomId: string;
  taskId: string;
  userId: string;
  agentUserId: string;
  /** The visitor's address when the call started: the agent's requests come from BytePlus. */
  ip: string;
  leadSource: LeadSource | null;
  /** Unix seconds. */
  expiresAt: number;
};

const sign = (payload: string, key: string): Buffer =>
  createHmac('sha256', key).update(payload).digest();

export const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const newVoiceIds = () => {
  const id = randomBytes(9).toString('hex');
  return {
    roomId: `hall_${id}`,
    taskId: `task_${id}`,
    userId: `visitor_${id}`,
    agentUserId: `agent_${id}`,
  };
};

const trimLead = (lead: LeadSource | null): LeadSource | null => {
  if (!lead) return null;
  const trimmed: LeadSource = {};
  for (const key of LEAD_SOURCE_KEYS) {
    const value = lead[key];
    if (value) trimmed[key] = value.slice(0, LEAD_FIELD_MAX);
  }
  return trimmed;
};

export const sealVoiceSession = (session: VoiceSession, key: string): string => {
  const payload = Buffer.from(
    JSON.stringify({ ...session, leadSource: trimLead(session.leadSource) })
  ).toString('base64url');
  return `${payload}.${sign(payload, key).toString('base64url')}`;
};

type OpenOptions = { now?: number; ignoreExpiry?: boolean };

export const openVoiceSession = (
  token: unknown,
  key: string,
  { now = Date.now() / 1000, ignoreExpiry = false }: OpenOptions = {}
): VoiceSession | null => {
  if (typeof token !== 'string' || token.length > 4096) return null;
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length > 0) return null;
  if (!safeEqual(signature, sign(payload, key).toString('base64url'))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as VoiceSession;
    if (typeof session.roomId !== 'string' || typeof session.expiresAt !== 'number') return null;
    if (!ignoreExpiry && session.expiresAt < now) return null;
    return session;
  } catch {
    return null;
  }
};
