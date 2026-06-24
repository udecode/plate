import { isRecord } from './record';
import type { YjsProviderLike, YjsProviderStatus } from './types';

const isYjsProviderStatus = (value: unknown): value is YjsProviderStatus =>
  typeof value === 'string';

const readBooleanProperty = (
  record: Readonly<Record<string, unknown>>,
  key: string
): boolean | null => {
  const value = record[key];

  return typeof value === 'boolean' ? value : null;
};

export const normalizeYjsProviderStatus = (
  value: unknown
): YjsProviderStatus | null => {
  if (isYjsProviderStatus(value)) {
    return value;
  }

  if (isRecord(value) && isYjsProviderStatus(value.status)) {
    return value.status;
  }

  return null;
};

export const normalizeYjsProviderSynced = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  return (
    readBooleanProperty(value, 'state') ?? readBooleanProperty(value, 'synced')
  );
};

export const readYjsProviderStatus = (
  provider: YjsProviderLike | undefined
): YjsProviderStatus | null => normalizeYjsProviderStatus(provider?.status);

export const readYjsProviderSynced = (
  provider: YjsProviderLike | undefined
): boolean | null => normalizeYjsProviderSynced(provider?.synced);

export const connectedFromYjsProviderStatus = (
  status: YjsProviderStatus | null,
  fallback: boolean
): boolean => {
  if (status === 'connected') {
    return true;
  }
  if (status === 'connecting' || status === 'disconnected') {
    return false;
  }

  return fallback;
};

export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  value !== null &&
  (typeof value === 'object' || typeof value === 'function') &&
  'then' in value &&
  typeof value.then === 'function';
