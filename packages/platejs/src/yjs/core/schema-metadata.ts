import type * as Y from 'yjs';

import type { EditorSchemaIdentity } from '../../core';
import {
  areEditorSchemaIdentitiesEqual,
  readEditorSchemaIdentity,
} from '../../core';
import { isRecord } from './record';

const SCHEMA_METADATA_FORMAT = 2;
const SCHEMA_METADATA_KEY = 'current';

export type YjsSchemaEnvelope = Readonly<{
  format: 2;
  identity: EditorSchemaIdentity;
}>;

const readEnvelopeProperties = (
  value: unknown
): Readonly<{ format: unknown; identity: unknown }> | undefined => {
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

    return { format: format.value, identity: identity.value };
  } catch {
    // Invalid metadata is treated as absent and renegotiated by the provider.
  }

  return undefined;
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
  `${rootName}:schema`;

export const readYjsSchemaEnvelope = (
  metadata: Y.Map<unknown>
): YjsSchemaEnvelope | null => {
  const value = metadata.get(SCHEMA_METADATA_KEY);

  if (value === undefined) return null;

  const properties = readEnvelopeProperties(value);
  const identity = readEditorSchemaIdentity(properties?.identity);

  if (properties?.format !== SCHEMA_METADATA_FORMAT || identity === undefined) {
    throw new Error('Invalid Yjs schema metadata envelope.');
  }

  return createYjsSchemaEnvelope(identity);
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
      `Yjs schema mismatch: local ${describeIdentity(local)} cannot join room ${describeIdentity(remote)}.`
    );
  }
  if (local.kind === 'derived') {
    throw new Error(
      `Yjs derived schema mismatch: local fingerprint ${local.fingerprint}, room fingerprint ${remote.fingerprint}.`
    );
  }
  if (remote.kind !== 'named') {
    throw new Error(
      `Yjs schema mismatch: local ${describeIdentity(local)} cannot join room ${describeIdentity(remote)}.`
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
