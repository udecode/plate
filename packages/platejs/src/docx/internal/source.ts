import type { EditorDocumentValue, EditorSchemaIdentity } from '../../core';
import type { DocxComment, DocxImportLimits } from './types';

type DocxSourceInput = Readonly<{
  blob: Blob;
  comments: readonly DocxComment[];
  document: EditorDocumentValue;
  limits: DocxImportLimits;
  schema: EditorSchemaIdentity;
}>;

export type DocxSourceLease = Readonly<DocxSourceInput>;

type DocxSourceState = {
  lease: DocxSourceLease | null;
};

const sourceStates = new WeakMap<DocxSource, DocxSourceState>();
let constructDocxSource: (input: DocxSourceInput) => DocxSource;

const cloneFrozen = <T>(value: T): T => {
  const clone = structuredClone(value);
  const freeze = (candidate: unknown): void => {
    if (candidate === null || typeof candidate !== 'object') return;
    if (Object.isFrozen(candidate)) return;

    for (const key of Reflect.ownKeys(candidate)) {
      freeze(Reflect.get(candidate, key));
    }
    Object.freeze(candidate);
  };

  freeze(clone);

  return clone;
};

/** Retained DOCX source correspondence for exact and source-aware export. */
export class DocxSource {
  private constructor() {}

  static {
    constructDocxSource = (input) => {
      const source = new DocxSource();

      sourceStates.set(source, {
        lease: Object.freeze({
          blob: input.blob,
          comments: cloneFrozen(input.comments),
          document: cloneFrozen(input.document),
          limits: cloneFrozen(input.limits),
          schema: cloneFrozen(input.schema),
        }),
      });

      return Object.freeze(source);
    };
  }

  /** Release retained package bytes and semantic correspondence. Idempotent. */
  dispose(): void {
    const state = sourceStates.get(this);

    if (state) state.lease = null;
  }
}

/** @internal */
export const createDocxSource = (input: DocxSourceInput): DocxSource =>
  constructDocxSource(input);

/** @internal */
export const acquireDocxSource = (
  source: DocxSource
):
  | Readonly<{ lease: DocxSourceLease; ok: true }>
  | Readonly<{ ok: false; reason: 'disposed' | 'invalid' }> => {
  const state = sourceStates.get(source);

  if (!state) return Object.freeze({ ok: false, reason: 'invalid' });
  if (!state.lease) return Object.freeze({ ok: false, reason: 'disposed' });

  return Object.freeze({ lease: state.lease, ok: true });
};

/** @internal */
export const docxSourceSchemaMatches = (
  left: EditorSchemaIdentity,
  right: EditorSchemaIdentity
) =>
  left.kind === right.kind &&
  left.fingerprint === right.fingerprint &&
  (left.kind === 'derived' ||
    (right.kind === 'named' &&
      left.id === right.id &&
      left.version === right.version));
