import {
  type DocumentChange,
  type DocumentChangeJson,
  rebaseDocumentChange,
} from '../core/change/document-change';
import type { SetValued } from '../core/change/effect-ledger';
import { jsonEqual } from '../core/change/json';
import { hasRootNames } from '../core/change/lazy-root';
import type { JsonEditorValue } from '../core/change/tokens';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { getValueRecords, recordStoreToJson } from '../core/record-store';
import { getCompiledPropertyMergeStrategy } from '../core/schema-compiler';
import type { AnyEditor } from '../interfaces/editor';

export const SYNC_PROTOCOL = 1;

/** Raised whenever either end changes how it rebases or judges a batch. */
export const SYNC_RULES = 2;

/** Both ends rebase with these settings, the accepted change first. */
export const SYNC_REBASE = {
  crossedMoves: 'first-wins',
  keepEqualInserts: true,
} as const;

/**
 * About half the 8 MB a Durable Object's SQLite row holds, so an entry fits
 * beside its other columns.
 */
export const SYNC_MAX_MESSAGE_BYTES = 4 * 1024 * 1024;

export const SYNC_MAX_BEFORE_WELCOME_BYTES = 16 * 1024;

const MAX_NESTING = 256;

const QUOTE = 0x22;
const BACKSLASH = 0x5c;
const OPEN_BRACE = 0x7b;
const OPEN_BRACKET = 0x5b;
const CLOSE_BRACE = 0x7d;
const CLOSE_BRACKET = 0x5d;

const encoder = new TextEncoder();

const closingQuote = (text: string, open: number) => {
  let at = text.indexOf('"', open + 1);

  while (at !== -1) {
    let slashes = 0;

    while (text.charCodeAt(at - 1 - slashes) === BACKSLASH) slashes += 1;
    if (slashes % 2 === 0) return at;
    at = text.indexOf('"', at + 1);
  }

  return text.length;
};

const nestingFits = (text: string) => {
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);

    if (unit === QUOTE) index = closingQuote(text, index);
    else if (unit === OPEN_BRACE || unit === OPEN_BRACKET) {
      depth += 1;
      if (depth > MAX_NESTING) return false;
    } else if (unit === CLOSE_BRACE || unit === CLOSE_BRACKET) depth -= 1;
  }

  return true;
};

export const measureMessage = (text: string, maxBytes: number) => {
  if (text.length > maxBytes) return null;

  const { read, written } = encoder.encodeInto(
    text,
    // UTF-8 never takes more than 3 bytes per UTF-16 unit.
    new Uint8Array(Math.min(maxBytes, text.length * 3))
  );

  return read === text.length && nestingFits(text) ? written : null;
};

export type SyncEntry = Readonly<{
  change: DocumentChangeJson;
  seq: number;
  version: number;
  writer: string;
}>;

export type SyncHello = Readonly<{
  /** Null for a tab that has never joined this room. */
  epoch: string | null;
  protocol: number;
  room: string;
  schema: string;
  type: 'hello';
  /** The last room version the tab holds, or null when it holds none. */
  version: number | null;
}>;

export type SyncSubmit = Readonly<{
  base: number;
  change: DocumentChangeJson;
  digest: string;
  seq: number;
  type: 'submit';
  writer: string;
}>;

export type SyncClientMessage = SyncHello | SyncSubmit;

export type SyncJoinRefusal =
  | 'protocol'
  | 'room'
  | 'schema'
  | 'size'
  | 'unauthorized';

export type SyncSubmitRefusal =
  | 'ahead'
  | 'digest'
  | 'expired'
  | 'grant'
  | 'hello'
  | 'invalid'
  | 'lost'
  | 'normalized'
  | 'record'
  | 'reused'
  | 'root-lifecycle'
  | 'schema'
  | 'size'
  | 'writer';

export type SyncSettled = 'accepted' | 'duplicate' | 'satisfied';

export type SyncReceipt = Readonly<{
  seq: number;
  type: 'receipt';
  version: number;
  writer: string;
}> &
  (
    | Readonly<{
        /** The change the room appended, when its bytes differ from the batch. */
        published?: DocumentChangeJson;
        status: SyncSettled;
      }>
    | Readonly<{ reason: SyncSubmitRefusal; status: 'refused' }>
    | Readonly<{ epoch: string; reason: 'epoch'; status: 'refused' }>
  );

export type SyncServerMessage =
  | Readonly<{ entries: readonly SyncEntry[]; from: number; type: 'entries' }>
  | Readonly<{
      epoch: string;
      schema: string;
      type: 'welcome';
      version: number;
    }>
  | Readonly<{ reason: SyncJoinRefusal; type: 'refused' }>
  | Readonly<{ epoch: string; reason: 'epoch'; type: 'refused' }>
  | Readonly<{ document: JsonEditorValue; type: 'snapshot'; version: number }>
  | SyncReceipt;

const sha256 = async (text: string) => {
  const bytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  );

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

export const digestOf = ({
  change,
  seq,
  writer,
}: Readonly<{ change: DocumentChangeJson; seq: number; writer: string }>) =>
  sha256(JSON.stringify({ writer, seq, change }));

export const schemaFingerprintOf = async (editor: AnyEditor) =>
  sha256(
    JSON.stringify({
      identity: editor.read.schema.identity(),
      records: [...getCompiledEditorSchema(editor).recordSets.keys()].sort(),
      rules: SYNC_RULES,
    })
  );

export const documentOf = (value: JsonEditorValue): JsonEditorValue => {
  const records = recordStoreToJson(getValueRecords(value));

  return {
    children: value.children,
    ...(value.roots && hasRootNames(value.roots) ? { roots: value.roots } : {}),
    ...(Object.keys(records).length > 0 ? { records } : {}),
  };
};

export const setValuedIn = (editor: AnyEditor): SetValued => {
  const compiled = getCompiledEditorSchema(editor);

  return (placement, key, context) =>
    getCompiledPropertyMergeStrategy(compiled, placement, key, context) ===
    'set';
};

export const sameDocument = (left: JsonEditorValue, right: JsonEditorValue) =>
  jsonEqual(documentOf(left), documentOf(right));

/**
 * Rebases `change` over the accepted changes one at a time, from the value
 * the first one applied to.
 */
export const rebaseOver = (
  accepted: readonly DocumentChange[],
  change: DocumentChange,
  base: JsonEditorValue
) => {
  let at = base;
  let moved = change;

  for (const entry of accepted) {
    const rebase = rebaseDocumentChange(entry, moved, at, SYNC_REBASE);

    if (rebase.kind !== 'pair') return rebase;

    moved = rebase.b;
    at = entry.apply(at);
  }

  return { change: moved, kind: 'rebased' } as const;
};
