import * as Y from 'yjs';

import {
  areEditorSchemaIdentitiesEqual,
  readEditorSchemaIdentity,
} from '../../core/schema-compiler';
import type { EditorSchemaIdentity } from '../../index';
import { isRecord } from './record';

const SCHEMA_METADATA_FORMAT = 5;
const SCHEMA_METADATA_KEY = 'current';
const SCHEMA_METADATA_SUFFIX = ':schema';

export type YjsSchemaEnvelope = Readonly<{
  format: typeof SCHEMA_METADATA_FORMAT;
  identity: EditorSchemaIdentity;
}>;

const readEnvelopeIdentity = (value: unknown): unknown => {
  if (!isRecord(value)) return undefined;

  try {
    const prototype = Object.getPrototypeOf(value);

    if (
      (prototype !== Object.prototype && prototype !== null) ||
      Reflect.ownKeys(value).length !== 2
    ) {
      return undefined;
    }

    const format = Object.getOwnPropertyDescriptor(value, 'format');
    const identity = Object.getOwnPropertyDescriptor(value, 'identity');

    if (
      !format ||
      !Object.hasOwn(format, 'value') ||
      format.enumerable !== true ||
      !identity ||
      !Object.hasOwn(identity, 'value') ||
      identity.enumerable !== true
    ) {
      return undefined;
    }

    return identity.value;
  } catch {
    return undefined;
  }
};

const freezeIdentity = (
  identity: EditorSchemaIdentity
): EditorSchemaIdentity =>
  identity.kind === 'derived'
    ? Object.freeze({
        fingerprint: identity.fingerprint,
        kind: 'derived',
      })
    : Object.freeze({
        fingerprint: identity.fingerprint,
        id: identity.id,
        kind: 'named',
        version: identity.version,
      });

export const createYjsSchemaEnvelope = (
  identity: EditorSchemaIdentity
): YjsSchemaEnvelope =>
  Object.freeze({
    format: SCHEMA_METADATA_FORMAT,
    identity: freezeIdentity(identity),
  });

export const getYjsSchemaMetadataName = (rootName: string): string =>
  `${rootName}${SCHEMA_METADATA_SUFFIX}`;

const readOwnValue = (value: unknown, key: string): unknown => {
  if (!isRecord(value)) return undefined;

  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    return descriptor && Object.hasOwn(descriptor, 'value')
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
};

const assertSchemaMetadataFormat = (format: unknown): void => {
  if (format === SCHEMA_METADATA_FORMAT) return;
  if (typeof format !== 'number') {
    throw new Error('Invalid Yjs schema metadata envelope.');
  }

  throw new Error(
    `Cannot open a Yjs document written with schema metadata format ${format}; this editor reads format ${SCHEMA_METADATA_FORMAT}.`
  );
};

export const readYjsSchemaEnvelope = (
  metadata: Y.Map<unknown>
): YjsSchemaEnvelope | null => {
  const value = metadata.get(SCHEMA_METADATA_KEY);

  if (value === undefined) return null;

  assertSchemaMetadataFormat(readOwnValue(value, 'format'));

  const identity = readEditorSchemaIdentity(readEnvelopeIdentity(value));

  if (identity === undefined) {
    throw new Error('Invalid Yjs schema metadata envelope.');
  }

  return createYjsSchemaEnvelope(identity);
};

// Yjs leaves a root that only a remote update created as a bare AbstractType,
// and getMap would permanently retype it, so a later getArray or getText on
// that name throws; the entry is read from the item store instead.
const readRootMapEntry = (
  type: NonNullable<ReturnType<Y.Doc['share']['get']>>,
  key: string
): unknown => {
  const { constructor } = type;

  if (constructor !== Y.Map && constructor !== Y.AbstractType) return undefined;

  const item = type._map.get(key);

  return item === undefined || item.deleted
    ? undefined
    : item.content.getContent()[item.length - 1];
};

export const assertYjsDocumentSchemaFormats = (doc: Y.Doc): void => {
  for (const [name, type] of doc.share) {
    if (!name.endsWith(SCHEMA_METADATA_SUFFIX)) continue;

    const value = readRootMapEntry(type, SCHEMA_METADATA_KEY);
    const format = readOwnValue(value, 'format');
    const identity = readOwnValue(value, 'identity');
    const kind = readOwnValue(identity, 'kind');

    if (
      typeof format !== 'number' ||
      (kind !== 'derived' && kind !== 'named') ||
      typeof readOwnValue(identity, 'fingerprint') !== 'string'
    ) {
      continue;
    }

    assertSchemaMetadataFormat(format);
  }
};

export const writeYjsSchemaEnvelope = (
  metadata: Y.Map<unknown>,
  identity: EditorSchemaIdentity
): void => {
  metadata.set(SCHEMA_METADATA_KEY, createYjsSchemaEnvelope(identity));
};

const describeIdentity = (identity: EditorSchemaIdentity): string =>
  identity.kind === 'derived'
    ? `derived schema (${identity.fingerprint})`
    : `schema "${identity.id}" v${identity.version} (${identity.fingerprint})`;

export const assertYjsSchemaIdentity = (
  local: EditorSchemaIdentity,
  remote: EditorSchemaIdentity
): void => {
  if (areEditorSchemaIdentitiesEqual(local, remote)) return;

  if (local.kind !== remote.kind) {
    throw new Error(
      `Yjs schema mismatch: local ${describeIdentity(
        local
      )} cannot join room ${describeIdentity(remote)}.`
    );
  }
  if (local.kind === 'derived') {
    throw new Error(
      `Yjs derived schema mismatch: local fingerprint ${local.fingerprint}, room fingerprint ${remote.fingerprint}.`
    );
  }
  if (remote.kind !== 'named') {
    throw new Error(
      `Yjs schema mismatch: local ${describeIdentity(
        local
      )} cannot join room ${describeIdentity(remote)}.`
    );
  }
  if (local.id !== remote.id) {
    throw new Error(
      `Yjs schema mismatch: local schema "${local.id}" cannot join room schema "${remote.id}".`
    );
  }
  if (local.version !== remote.version) {
    throw new Error(
      `Yjs schema mismatch for "${local.id}": local version ${local.version}, room version ${remote.version}.`
    );
  }
  if (local.fingerprint !== remote.fingerprint) {
    throw new Error(
      `Yjs schema mismatch for "${local.id}" v${local.version}: local fingerprint ${local.fingerprint}, room fingerprint ${remote.fingerprint}; semantics changed without a version bump.`
    );
  }
};
