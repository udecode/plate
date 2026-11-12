import {
  type DocumentChange,
  type DocumentChangeJson,
  rebaseDocumentChange,
} from '../core/change/document-change';
import { hasRootNames } from '../core/change/lazy-root';
import type { JsonEditorValue } from '../core/change/tokens';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { getValueRecords, recordStoreToJson } from '../core/record-store';
import type { AnyEditor } from '../interfaces/editor';

export const SYNC_PROTOCOL = 1;

/** Raised whenever either end changes how it rebases or judges a batch. */
export const SYNC_RULES = 2;

/** Both ends rebase with these settings, the accepted change first. */
export const SYNC_REBASE = {
  crossedMoves: 'first-wins',
  keepEqualInserts: true,
} as const;

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
  | 'epoch'
  | 'protocol'
  | 'room'
  | 'schema'
  | 'unauthorized';

export type SyncSubmitRefusal =
  | 'ahead'
  | 'digest'
  | 'epoch'
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

export const schemaFingerprintOf = (editor: AnyEditor) =>
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
