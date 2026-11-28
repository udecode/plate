import {
  type DocumentChange,
  type DocumentChangeJson,
  getV4Steps,
  rebaseDocumentChange,
} from '../core/change/document-change';
import { jsonEqual } from '../core/change/json';
import { hasRootNames } from '../core/change/lazy-root';
import type { DocumentSetPropertyResolver } from '../core/change/root-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonNode,
} from '../core/change/tokens';
import { extractV4Between } from '../core/change/v4/extract';
import { V4_REGISTER_SET, type V4Step } from '../core/change/v4/types';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { getValueRecords, recordStoreToJson } from '../core/record-store';
import { getCompiledPropertyMergeStrategy } from '../core/schema-compiler';
import type { AnyEditor } from '../interfaces/editor';

export const SYNC_PROTOCOL = 1;

/** Raised whenever either end changes how it rebases or judges a batch. */
export const SYNC_RULES = 8;

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
      records: [
        ...new Set([
          ...getCompiledEditorSchema(editor).recordSets.keys(),
          V4_REGISTER_SET,
        ]),
      ].sort(),
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

export const setValuedIn = (editor: AnyEditor): DocumentSetPropertyResolver => {
  const compiled = getCompiledEditorSchema(editor);

  return (_node, key, context) =>
    getCompiledPropertyMergeStrategy(
      compiled,
      context.placement,
      key,
      context
    ) === 'set';
};

export const sameDocument = (left: JsonEditorValue, right: JsonEditorValue) =>
  jsonEqual(documentOf(left), documentOf(right));

export type SyncVerdict = 'contested' | 'held' | 'lost' | 'unjudged';

export const dispositionOf = (
  verdict: SyncVerdict,
  stretch: 'live' | 'offline'
): 'send' | Exclude<SyncVerdict, 'held'> =>
  verdict === 'held' || (verdict === 'contested' && stretch === 'live')
    ? 'send'
    : verdict;

const collectElementIds = (nodes: readonly JsonNode[], into: Set<string>) => {
  for (const node of nodes) {
    if (!isElementNode(node)) continue;
    if (typeof node.id === 'string' && node.id.length > 0) into.add(node.id);
    collectElementIds(node.children, into);
  }
};

const writtenIdsOfSteps = (steps: readonly V4Step[]): Set<string> => {
  const ids = new Set<string>();

  for (const step of steps) {
    switch (step.op) {
      case 'insert_text':
      case 'delete_text':
      case 'format_text':
      case 'wrap_inline': {
        ids.add(step.target);
        break;
      }
      case 'unwrap_inline': {
        ids.add(step.id);
        ids.add(step.parent);
        break;
      }
      case 'insert_node': {
        if ('id' in step.to) ids.add(step.to.id);
        collectElementIds([step.node], ids);
        break;
      }
      case 'remove_node':
      case 'set_props':
      case 'move_node': {
        ids.add(step.id);
        if (step.op === 'move_node' && 'id' in step.to) ids.add(step.to.id);
        break;
      }
      case 'split_node': {
        ids.add(step.id);
        ids.add(step.newId);
        break;
      }
      case 'join_nodes': {
        ids.add(step.target);
        ids.add(step.source);
        break;
      }
      case 'create_root':
      case 'delete_root':
      case 'set_register': {
        break;
      }
    }
  }

  return ids;
};

const stepsOfChange = (
  change: DocumentChange,
  before: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver
): readonly V4Step[] =>
  getV4Steps(change) ??
  (change.empty
    ? []
    : extractV4Between(before, change.apply(before), { isSetValued }));

/**
 * Judges whether a rebuilt decision `merged` at `head` preserves `own` and all
 * unrelated concurrent writes in `accepted` using v4 ID-addressed steps.
 */
export const judgeV4DecisionSpan = ({
  accepted,
  base,
  isSetValued,
  merged,
  own,
}: Readonly<{
  accepted: readonly DocumentChange[];
  base: JsonEditorValue;
  isSetValued: DocumentSetPropertyResolver;
  merged: DocumentChange;
  own: DocumentChange;
}>): SyncVerdict => {
  let head = base;
  const acceptedWrittenIds = new Set<string>();

  for (const entry of accepted) {
    for (const id of writtenIdsOfSteps(
      stepsOfChange(entry, head, isSetValued)
    )) {
      acceptedWrittenIds.add(id);
    }
    head = entry.apply(head);
  }

  const mergedDoc = merged.apply(head);
  const rebased = rebaseOver(accepted, own, base);

  if (rebased.kind === 'rebased') {
    const expectedDoc = rebased.change.apply(head);

    if (sameDocument(mergedDoc, expectedDoc)) return 'held';
  }

  if (merged.empty) {
    if (own.empty) return 'held';
    if (rebased.kind === 'rebased' && rebased.satisfied) return 'held';

    return 'lost';
  }

  const headIds = new Set<string>();

  collectElementIds(head.children, headIds);
  if (head.roots) {
    for (const nodes of Object.values(head.roots)) {
      collectElementIds(nodes, headIds);
    }
  }

  const ownSteps = stepsOfChange(own, base, isSetValued);
  const mergedSteps = stepsOfChange(merged, head, isSetValued);
  const structuralOps = new Set([
    'insert_node',
    'join_nodes',
    'move_node',
    'remove_node',
    'split_node',
  ]);
  const mergedOps = new Set(mergedSteps.map((step) => step.op));

  for (const step of ownSteps) {
    if (structuralOps.has(step.op) && !mergedOps.has(step.op)) {
      return 'lost';
    }
    if (
      step.op === 'join_nodes' &&
      headIds.has(step.source) &&
      headIds.has(step.target) &&
      !mergedSteps.some(
        (candidate) =>
          candidate.op === 'join_nodes' &&
          candidate.source === step.source &&
          candidate.target === step.target
      )
    ) {
      return 'lost';
    }
  }

  const ownWrittenIds = writtenIdsOfSteps(ownSteps);
  const mergedWrittenIds = writtenIdsOfSteps(mergedSteps);
  let ownContested = false;

  for (const id of ownWrittenIds) {
    if (acceptedWrittenIds.has(id)) {
      ownContested = true;
      break;
    }
  }

  if (ownContested) return 'contested';

  for (const id of mergedWrittenIds) {
    if (acceptedWrittenIds.has(id) && !ownWrittenIds.has(id)) {
      return 'lost';
    }
  }

  return 'held';
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
  let satisfied = false;

  for (const entry of accepted) {
    const rebase = rebaseDocumentChange(entry, moved, at, SYNC_REBASE);

    if (rebase.kind !== 'pair') return rebase;

    if (rebase.bOutcomes?.some((outcome) => outcome === 'satisfied')) {
      satisfied = true;
    }
    moved = rebase.b;
    at = entry.apply(at);
  }

  return { change: moved, kind: 'rebased', satisfied } as const;
};
