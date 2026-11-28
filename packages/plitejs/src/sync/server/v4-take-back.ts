import {
  type DocumentChange,
  getInternalDocumentChangeRecords,
  getV4Steps,
  withoutRetainedRecordSets,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../../core/change/tokens';
import type { V4Step } from '../../core/change/v4/types';
import type { LaterEntry } from '../../core/change/window';
import { getRecordText, getValueRecords } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { rebaseOver, sameDocument } from '../protocol';
import type { SyncGrant, SyncWriteCheck } from './grant';

export type { LaterEntry } from '../../core/change/window';

export type PutEntry = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  /** The entries admitted since, oldest first. */
  later: readonly LaterEntry[];
  writer: string;
}>;

const collectElementIds = (nodes: readonly JsonNode[], into: Set<string>) => {
  for (const node of nodes) {
    if (!isElementNode(node)) continue;
    if (typeof node.id === 'string' && node.id.length > 0) into.add(node.id);
    collectElementIds(node.children, into);
  }
};

const touchedIdsOfSteps = (steps: readonly V4Step[]): Set<string> => {
  const ids = new Set<string>();

  for (const step of steps) {
    switch (step.op) {
      case 'insert_text':
      case 'delete_text':
      case 'format_text': {
        ids.add(step.target);
        break;
      }
      case 'insert_node': {
        if ('id' in step.to) ids.add(step.to.id);
        collectElementIds([step.node], ids);
        break;
      }
      case 'remove_node':
      case 'set_props': {
        ids.add(step.id);
        break;
      }
      case 'move_node': {
        ids.add(step.id);
        if ('id' in step.to) ids.add(step.to.id);
        break;
      }
      case 'split_node': {
        ids.add(step.id);
        ids.add(step.newId);
        break;
      }
      case 'join_nodes': {
        ids.add(step.source);
        ids.add(step.target);
        break;
      }
      case 'wrap_inline': {
        ids.add(step.target);
        collectElementIds([step.node], ids);
        break;
      }
      case 'unwrap_inline': {
        ids.add(step.id);
        ids.add(step.parent);
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

const ancestorsOfIds = (
  value: JsonEditorValue,
  targets: ReadonlySet<string>
): Set<string> => {
  const expanded = new Set<string>(targets);
  const walk = (nodes: readonly JsonNode[], stack: readonly string[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      const id =
        typeof node.id === 'string' && node.id.length > 0 ? node.id : null;

      if (id && targets.has(id)) {
        for (const ancestor of stack) expanded.add(ancestor);
        collectElementIds(node.children, expanded);
      }
      walk(node.children, id ? [...stack, id] : stack);
    }
  };

  walk(value.children, []);
  if (value.roots) {
    for (const nodes of Object.values(value.roots)) walk(nodes, []);
  }

  return expanded;
};

const keepsItsRecords = (entry: PutEntry, head: JsonEditorValue) => {
  const written = getValueRecords(entry.after);

  return [...entry.later.map(({ after }) => after), head].every((value) => {
    const store = getValueRecords(value);

    return [...getInternalDocumentChangeRecords(entry.change)].every(
      ([set, ids]) =>
        [...ids.keys()].every(
          (id) =>
            getRecordText(store, set, id) === getRecordText(written, set, id)
        )
    );
  });
};

export const v4PutAllIndexOf = (
  changes: readonly DocumentChange[],
  set: string,
  ids: readonly string[]
) => {
  const putsOf = (change: DocumentChange) => {
    const ops = getInternalDocumentChangeRecords(change).get(set);

    return ids.filter((id) => typeof ops?.get(id) === 'string').length;
  };
  const index = changes.findLastIndex((change) => putsOf(change) > 0);

  return index !== -1 && putsOf(changes[index]) === ids.length ? index : null;
};

export const v4PutEntryAt = (
  entries: readonly LaterEntry[],
  index: number
): PutEntry => ({ ...entries[index], later: entries.slice(index + 1) });

export const v4TakeBack = (
  entry: PutEntry,
  head: JsonEditorValue,
  schema: CompiledEditorSchema
): DocumentChange | null => {
  if (!keepsItsRecords(entry, head)) return null;

  const inverse = withoutRetainedRecordSets(
    entry.change.invert(entry.before),
    schema.recordSets
  );

  if (
    entry.later.every(({ writer }) => writer === entry.writer) &&
    sameDocument(head, entry.after)
  ) {
    return inverse;
  }
  if (entry.change.createRoots.size > 0 || entry.change.deleteRoots.size > 0) {
    return null;
  }

  const entrySteps = getV4Steps(entry.change);

  if (!entrySteps) return null;

  const entryTouched = touchedIdsOfSteps(entrySteps);
  const ownedIds = new Set([
    ...ancestorsOfIds(entry.before, entryTouched),
    ...ancestorsOfIds(entry.after, entryTouched),
  ]);

  for (const later of entry.later) {
    if (later.writer === entry.writer) continue;

    const laterSteps = getV4Steps(later.change);

    if (!laterSteps) return null;

    const laterTouched = touchedIdsOfSteps(laterSteps);
    const laterIds = new Set([
      ...ancestorsOfIds(later.before, laterTouched),
      ...ancestorsOfIds(later.after, laterTouched),
    ]);

    for (const id of laterIds) {
      if (ownedIds.has(id)) return null;
    }
  }

  const rebased = rebaseOver(
    entry.later.map((later) => later.change),
    inverse,
    entry.after
  );

  if (rebased.kind === 'rebased' && !rebased.satisfied) {
    try {
      rebased.change.apply(head);

      return rebased.change;
    } catch {
      // ignore
    }
  }

  const afterElements = collectElementsById(entry.after);
  const headElements = collectElementsById(head);
  const ownedUnchanged = [...ownedIds].every((id) =>
    jsonEqual(afterElements.get(id), headElements.get(id))
  );

  if (ownedUnchanged) {
    try {
      inverse.apply(head);

      return inverse;
    } catch {
      return null;
    }
  }

  if (rebased.kind === 'rebased') {
    try {
      rebased.change.apply(head);

      return rebased.change;
    } catch {
      return null;
    }
  }

  return null;
};

const collectElementsById = (
  value: JsonEditorValue
): Map<string, JsonElementNode> => {
  const map = new Map<string, JsonElementNode>();
  const walk = (nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (typeof node.id === 'string' && node.id.length > 0) {
        map.set(node.id, node);
      }
      walk(node.children);
    }
  };

  walk(value.children);
  if (value.roots) {
    for (const nodes of Object.values(value.roots)) walk(nodes);
  }

  return map;
};

export const v4OwnTakeBack = (
  entries: readonly LaterEntry[],
  writer: string,
  grant: SyncGrant,
  covers: SyncWriteCheck,
  head: JsonEditorValue,
  after: JsonEditorValue,
  schema: CompiledEditorSchema
): DocumentChange | null => {
  const headElements = collectElementsById(head);
  const afterElements = collectElementsById(after);
  const headRecords = getValueRecords(head);
  const afterRecords = getValueRecords(after);

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const candidate = entries[index];

    if (candidate.writer !== writer) continue;

    const candidateSteps = getV4Steps(candidate.change);

    if (
      candidateSteps &&
      candidate.change.createRoots.size === 0 &&
      candidate.change.deleteRoots.size === 0
    ) {
      const ids = touchedIdsOfSteps(candidateSteps);
      const anyIdDiffers = [...ids].some(
        (id) => !jsonEqual(headElements.get(id), afterElements.get(id))
      );
      const anyRecordDiffers = [
        ...getInternalDocumentChangeRecords(candidate.change),
      ].some(([set, recordIds]) =>
        [...recordIds.keys()].some(
          (id) =>
            getRecordText(headRecords, set, id) !==
            getRecordText(afterRecords, set, id)
        )
      );

      if (!anyIdDiffers && !anyRecordDiffers) continue;
    }

    const entry = v4PutEntryAt(entries, index);
    const change = v4TakeBack(entry, head, schema);

    if (!change) continue;

    let result: JsonEditorValue | null = null;

    try {
      result = change.apply(head);
    } catch {
      result = null;
    }

    if (
      result &&
      sameDocument(result, after) &&
      covers(entry, grant, schema).kind === 'covered'
    ) {
      return change;
    }
  }

  return null;
};
