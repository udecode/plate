import type { DocumentChangeJson } from '../../core/change/document-change';
import type { SyncClientMessage } from '../protocol';

export type MalformedSubmit = Readonly<{
  seq: number;
  type: 'malformed';
  writer: string;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value);

const isCount = (value: unknown): value is number =>
  isInteger(value) && value >= 0;

const isVersion3Change = (value: unknown): value is DocumentChangeJson =>
  isRecord(value) && value.version === 3;

export const readClientMessage = (
  data: string
): MalformedSubmit | SyncClientMessage | null => {
  let message: unknown;

  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }

  if (!isRecord(message)) return null;

  const { type } = message;

  if (type === 'hello') {
    const { epoch, protocol, room, schema, version } = message;

    return typeof protocol === 'number' &&
      typeof room === 'string' &&
      (epoch === null || typeof epoch === 'string') &&
      typeof schema === 'string' &&
      (version === null || isCount(version))
      ? { epoch, protocol, room, schema, type, version }
      : null;
  }
  if (type === 'submit') {
    const { base, change, digest, seq, writer } = message;

    if (typeof writer !== 'string' || !isInteger(seq)) return null;

    return isCount(base) &&
      isVersion3Change(change) &&
      typeof digest === 'string' &&
      isCount(seq)
      ? { base, change, digest, seq, type, writer }
      : { seq, type: 'malformed', writer };
  }

  return null;
};
