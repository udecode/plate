import type { RecordOpsJson } from '../../record-store';
import { cloneJson, isRecord, jsonEqual, type JsonRecord } from '../json';
import { isElementNode, type JsonElementNode, type JsonNode } from '../tokens';

export type V4Place =
  | Readonly<{ index: number; root: string }>
  | Readonly<{ id: string; index: number }>
  | Readonly<{ id: string; offset: number }>;

export type V4PropDelta = Readonly<{
  add?: Readonly<Record<string, readonly unknown[]>>;
  remove?: Readonly<Record<string, readonly unknown[]>>;
  set?: JsonRecord;
  unset?: readonly string[];
}>;

export type V4Step =
  | Readonly<{
      marks?: JsonRecord;
      offset: number;
      op: 'insert_text';
      target: string;
      text: string;
    }>
  | Readonly<{
      length: number;
      offset: number;
      op: 'delete_text';
      target: string;
    }>
  | (V4PropDelta &
      Readonly<{
        length: number;
        offset: number;
        op: 'format_text';
        target: string;
      }>)
  | Readonly<{ node: JsonElementNode; op: 'insert_node'; to: V4Place }>
  | Readonly<{ id: string; op: 'remove_node' }>
  | Readonly<{ id: string; op: 'move_node'; to: V4Place }>
  | Readonly<{
      at: number;
      id: string;
      newId: string;
      op: 'split_node';
      props?: JsonRecord;
    }>
  | Readonly<{ op: 'join_nodes'; source: string; target: string }>
  | (V4PropDelta & Readonly<{ id: string; op: 'set_props' }>)
  | Readonly<{
      length: number;
      node: JsonElementNode;
      offset: number;
      op: 'wrap_inline';
      target: string;
    }>
  | Readonly<{ id: string; op: 'unwrap_inline'; parent: string }>
  | Readonly<{ op: 'create_root'; root: string }>
  | Readonly<{ op: 'delete_root'; root: string }>
  | Readonly<{
      after: string | null;
      expectedWriteId?: string | null;
      id: string;
      op: 'set_register';
      set: string;
      writeId: string;
    }>;

export type DocumentChangeJson = Readonly<{
  records?: RecordOpsJson;
  steps?: readonly V4Step[];
  version: 4;
}>;

export const V4_REGISTER_SET = 'shared-state';

const UNSAFE_KEYS: ReadonlySet<string> = new Set([
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  '__proto__',
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'prototype',
  'toLocaleString',
  'toString',
  'valueOf',
]);

const RESERVED_NODE_KEYS: ReadonlySet<string> = new Set(['children', 'text']);

export const isSafeV4Key = (key: unknown): key is string =>
  typeof key === 'string' && key.length > 0 && !UNSAFE_KEYS.has(key);

export const assertSafeV4Key = (key: unknown, label: string): string => {
  if (!isSafeV4Key(key)) {
    throw new Error(`Invalid v4 ${label} "${String(key)}".`);
  }

  return key;
};

export const assertSafePropKey = (key: unknown, label: string): string => {
  const safe = assertSafeV4Key(key, label);

  if (RESERVED_NODE_KEYS.has(safe)) {
    throw new Error(`Reserved v4 ${label} "${safe}" is not allowed.`);
  }

  return safe;
};

export const assertNonEmptyId = (id: unknown, label: string): string => {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error(`Invalid v4 ${label}: expected non-empty string.`);
  }

  return id;
};

export const assertNonNegativeInt = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid v4 ${label}: expected non-negative integer.`);
  }

  return value;
};

const stableValueKey = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableValueKey).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableValueKey(record[key])}`);

  return `{${entries.join(',')}}`;
};

export const normalizeV4SetValues = (values: readonly unknown[]): unknown[] => {
  const keyed: Array<readonly [string, unknown]> = [];
  const seen = new Set<string>();

  for (const value of values) {
    const key = stableValueKey(value);

    if (seen.has(key)) continue;
    seen.add(key);
    keyed.push([key, cloneJson(value)] as const);
  }

  keyed.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));

  return keyed.map(([, value]) => value);
};

export const subtractV4SetValues = (
  values: readonly unknown[],
  removed: readonly unknown[]
): unknown[] =>
  normalizeV4SetValues(
    values.filter(
      (value) => !removed.some((candidate) => jsonEqual(value, candidate))
    )
  );

export const isEmptyPropDelta = (delta: V4PropDelta): boolean =>
  (!delta.set || Object.keys(delta.set).length === 0) &&
  (!delta.unset || delta.unset.length === 0) &&
  (!delta.add || Object.keys(delta.add).length === 0) &&
  (!delta.remove || Object.keys(delta.remove).length === 0);

export const applyPropDeltaToRecord = (
  base: Readonly<JsonRecord>,
  delta: V4PropDelta,
  options: Readonly<{ forbidIdMutation?: boolean }> = {}
): JsonRecord => {
  const next: JsonRecord = { ...cloneJson(base) };

  if (delta.unset) {
    for (const key of delta.unset) {
      assertSafePropKey(key, 'property key');
      if (
        options.forbidIdMutation &&
        key === 'id' &&
        Object.hasOwn(base, 'id')
      ) {
        throw new Error('Element property "id" cannot be changed.');
      }
      delete next[key];
    }
  }

  if (delta.set) {
    for (const [key, value] of Object.entries(delta.set)) {
      assertSafePropKey(key, 'property key');
      if (
        options.forbidIdMutation &&
        key === 'id' &&
        Object.hasOwn(base, 'id') &&
        !jsonEqual(value, base.id)
      ) {
        throw new Error('Element property "id" cannot be changed.');
      }
      next[key] = cloneJson(value);
    }
  }

  if (delta.add) {
    for (const [key, values] of Object.entries(delta.add)) {
      assertSafePropKey(key, 'set-valued property key');
      if (options.forbidIdMutation && key === 'id') {
        throw new Error('Element property "id" cannot be changed.');
      }
      const existing = next[key];

      if (existing !== undefined && !Array.isArray(existing)) {
        throw new Error(
          `Cannot apply v4 set-valued add to non-array property "${key}".`
        );
      }

      const merged = normalizeV4SetValues([
        ...(Array.isArray(existing) ? existing : []),
        ...values,
      ]);

      if (merged.length > 0) next[key] = merged;
      else delete next[key];
    }
  }

  if (delta.remove) {
    for (const [key, values] of Object.entries(delta.remove)) {
      assertSafePropKey(key, 'set-valued property key');
      if (options.forbidIdMutation && key === 'id') {
        throw new Error('Element property "id" cannot be changed.');
      }
      const existing = next[key];

      if (existing === undefined) continue;
      if (!Array.isArray(existing)) {
        throw new Error(
          `Cannot apply v4 set-valued remove to non-array property "${key}".`
        );
      }

      const remaining = subtractV4SetValues(existing, values);

      if (remaining.length > 0) next[key] = remaining;
      else delete next[key];
    }
  }

  return next;
};

export const invertPropDelta = (
  before: Readonly<JsonRecord>,
  delta: V4PropDelta
): V4PropDelta => {
  const set: JsonRecord = {};
  const unset: string[] = [];
  const add: Record<string, unknown[]> = {};
  const remove: Record<string, unknown[]> = {};

  if (delta.set) {
    for (const key of Object.keys(delta.set)) {
      if (Object.hasOwn(before, key)) {
        set[key] = cloneJson(before[key]);
      } else {
        unset.push(key);
      }
    }
  }

  if (delta.unset) {
    for (const key of delta.unset) {
      if (Object.hasOwn(before, key) && !Object.hasOwn(set, key)) {
        set[key] = cloneJson(before[key]);
      }
    }
  }

  if (delta.add) {
    for (const [key, added] of Object.entries(delta.add)) {
      const prior = Array.isArray(before[key])
        ? (before[key] as readonly unknown[])
        : [];
      const actuallyAdded = subtractV4SetValues(added, prior);

      if (actuallyAdded.length > 0) {
        remove[key] = actuallyAdded;
      }
    }
  }

  if (delta.remove) {
    for (const [key, removed] of Object.entries(delta.remove)) {
      const prior = Array.isArray(before[key])
        ? (before[key] as readonly unknown[])
        : [];
      const actuallyRemoved = normalizeV4SetValues(
        removed.filter((item) =>
          prior.some((existing) => jsonEqual(existing, item))
        )
      );

      if (actuallyRemoved.length > 0) {
        add[key] = actuallyRemoved;
      }
    }
  }

  return {
    ...(Object.keys(add).length > 0 ? { add } : {}),
    ...(Object.keys(remove).length > 0 ? { remove } : {}),
    ...(Object.keys(set).length > 0 ? { set } : {}),
    ...(unset.length > 0 ? { unset: unset.sort() } : {}),
  };
};

export const assertV4Place = (place: unknown): V4Place => {
  if (!isRecord(place)) {
    throw new Error('Invalid v4 place: expected object.');
  }

  const keys = Object.keys(place);

  if (keys.length === 2 && 'root' in place && 'index' in place) {
    assertSafeV4Key(place.root, 'root');
    assertNonNegativeInt(place.index, 'place index');

    return place as V4Place;
  }
  if (keys.length === 2 && 'id' in place && 'index' in place) {
    assertNonEmptyId(place.id, 'place id');
    assertNonNegativeInt(place.index, 'place index');

    return place as V4Place;
  }
  if (keys.length === 2 && 'id' in place && 'offset' in place) {
    assertNonEmptyId(place.id, 'place id');
    assertNonNegativeInt(place.offset, 'place offset');

    return place as V4Place;
  }

  throw new Error('Invalid v4 place shape.');
};

const assertV4PropDeltaFields = (record: Record<string, unknown>) => {
  if (record.set !== undefined) {
    if (!isRecord(record.set)) {
      throw new Error('Invalid v4 prop delta "set": expected object.');
    }
    for (const key of Object.keys(record.set)) {
      assertSafePropKey(key, 'property key');
    }
  }
  if (record.unset !== undefined) {
    if (!Array.isArray(record.unset)) {
      throw new Error('Invalid v4 prop delta "unset": expected array.');
    }
    for (const key of record.unset) {
      assertSafePropKey(key, 'property key');
    }
  }
  if (record.add !== undefined) {
    if (!isRecord(record.add)) {
      throw new Error('Invalid v4 prop delta "add": expected object.');
    }
    for (const [key, values] of Object.entries(record.add)) {
      assertSafePropKey(key, 'set-valued property key');
      if (!Array.isArray(values)) {
        throw new Error(`Invalid v4 prop delta "add.${key}": expected array.`);
      }
    }
  }
  if (record.remove !== undefined) {
    if (!isRecord(record.remove)) {
      throw new Error('Invalid v4 prop delta "remove": expected object.');
    }
    for (const [key, values] of Object.entries(record.remove)) {
      assertSafePropKey(key, 'set-valued property key');
      if (!Array.isArray(values)) {
        throw new Error(
          `Invalid v4 prop delta "remove.${key}": expected array.`
        );
      }
    }
  }
};

const assertNoExtraKeys = (
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  op: string
) => {
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      throw new Error(`Unexpected key "${key}" on v4 step "${op}".`);
    }
  }
};

const assertV4ElementNode = (node: unknown, label: string): JsonElementNode => {
  if (!isElementNode(node as JsonNode)) {
    throw new Error(`Invalid v4 ${label}: expected element node.`);
  }

  const element = node as JsonElementNode;

  assertNonEmptyId(element.id, `${label}.id`);

  return element;
};

export const assertV4Step = (step: unknown): V4Step => {
  if (!isRecord(step) || typeof step.op !== 'string') {
    throw new Error('Invalid v4 step: expected object with op.');
  }

  switch (step.op) {
    case 'insert_text': {
      assertNoExtraKeys(
        step,
        new Set(['marks', 'offset', 'op', 'target', 'text']),
        step.op
      );
      assertNonEmptyId(step.target, 'target');
      assertNonNegativeInt(step.offset, 'offset');
      if (typeof step.text !== 'string') {
        throw new Error('Invalid v4 insert_text: text must be a string.');
      }
      if (step.marks !== undefined) {
        if (!isRecord(step.marks)) {
          throw new Error('Invalid v4 insert_text: marks must be an object.');
        }
        for (const key of Object.keys(step.marks)) {
          assertSafePropKey(key, 'mark key');
        }
      }
      return step as V4Step;
    }
    case 'delete_text': {
      assertNoExtraKeys(
        step,
        new Set(['length', 'offset', 'op', 'target']),
        step.op
      );
      assertNonEmptyId(step.target, 'target');
      assertNonNegativeInt(step.offset, 'offset');
      assertNonNegativeInt(step.length, 'length');
      return step as V4Step;
    }
    case 'format_text': {
      assertNoExtraKeys(
        step,
        new Set([
          'add',
          'length',
          'offset',
          'op',
          'remove',
          'set',
          'target',
          'unset',
        ]),
        step.op
      );
      assertNonEmptyId(step.target, 'target');
      assertNonNegativeInt(step.offset, 'offset');
      assertNonNegativeInt(step.length, 'length');
      assertV4PropDeltaFields(step);
      return step as V4Step;
    }
    case 'insert_node': {
      assertNoExtraKeys(step, new Set(['node', 'op', 'to']), step.op);
      assertV4Place(step.to);
      assertV4ElementNode(step.node, 'insert_node.node');
      return step as V4Step;
    }
    case 'remove_node': {
      assertNoExtraKeys(step, new Set(['id', 'op']), step.op);
      assertNonEmptyId(step.id, 'id');
      return step as V4Step;
    }
    case 'move_node': {
      assertNoExtraKeys(step, new Set(['id', 'op', 'to']), step.op);
      assertNonEmptyId(step.id, 'id');
      assertV4Place(step.to);
      return step as V4Step;
    }
    case 'split_node': {
      assertNoExtraKeys(
        step,
        new Set(['at', 'id', 'newId', 'op', 'props']),
        step.op
      );
      assertNonEmptyId(step.id, 'id');
      assertNonEmptyId(step.newId, 'newId');
      assertNonNegativeInt(step.at, 'at');
      if (step.props !== undefined) {
        if (!isRecord(step.props)) {
          throw new Error('Invalid v4 split_node: props must be an object.');
        }
        for (const key of Object.keys(step.props)) {
          assertSafePropKey(key, 'split prop key');
        }
      }
      return step as V4Step;
    }
    case 'join_nodes': {
      assertNoExtraKeys(step, new Set(['op', 'source', 'target']), step.op);
      assertNonEmptyId(step.target, 'target');
      assertNonEmptyId(step.source, 'source');
      return step as V4Step;
    }
    case 'set_props': {
      assertNoExtraKeys(
        step,
        new Set(['add', 'id', 'op', 'remove', 'set', 'unset']),
        step.op
      );
      assertNonEmptyId(step.id, 'id');
      assertV4PropDeltaFields(step);
      return step as V4Step;
    }
    case 'wrap_inline': {
      assertNoExtraKeys(
        step,
        new Set(['length', 'node', 'offset', 'op', 'target']),
        step.op
      );
      assertNonEmptyId(step.target, 'target');
      assertNonNegativeInt(step.offset, 'offset');
      assertNonNegativeInt(step.length, 'length');
      assertV4ElementNode(step.node, 'wrap_inline.node');
      return step as V4Step;
    }
    case 'unwrap_inline': {
      assertNoExtraKeys(step, new Set(['id', 'op', 'parent']), step.op);
      assertNonEmptyId(step.id, 'id');
      assertNonEmptyId(step.parent, 'parent');
      return step as V4Step;
    }
    case 'create_root': {
      assertNoExtraKeys(step, new Set(['op', 'root']), step.op);
      const root = assertSafeV4Key(step.root, 'root');
      if (root === 'main') {
        throw new Error('Cannot create primary root "main".');
      }
      return step as V4Step;
    }
    case 'delete_root': {
      assertNoExtraKeys(step, new Set(['op', 'root']), step.op);
      if (typeof step.root !== 'string' || step.root.length === 0) {
        throw new Error(`Invalid v4 root "${String(step.root)}".`);
      }
      if (step.root === 'main') {
        throw new Error('Cannot delete primary root "main".');
      }
      return step as V4Step;
    }
    case 'set_register': {
      assertNoExtraKeys(
        step,
        new Set(['after', 'expectedWriteId', 'id', 'op', 'set', 'writeId']),
        step.op
      );
      assertSafeV4Key(step.set, 'register set');
      assertSafeV4Key(step.id, 'register id');
      if (step.after !== null && typeof step.after !== 'string') {
        throw new Error(
          'Invalid v4 set_register: after must be a string or null.'
        );
      }
      assertNonEmptyId(step.writeId, 'writeId');
      if (
        step.expectedWriteId !== undefined &&
        step.expectedWriteId !== null &&
        typeof step.expectedWriteId !== 'string'
      ) {
        throw new Error(
          'Invalid v4 set_register: expectedWriteId must be string, null, or undefined.'
        );
      }
      return step as V4Step;
    }
    default: {
      throw new Error(`Unknown v4 step op "${step.op}".`);
    }
  }
};

export const assertV4Steps = (steps: unknown): readonly V4Step[] => {
  if (!Array.isArray(steps)) {
    throw new Error('Invalid v4 steps: expected array.');
  }

  return steps.map((step) => assertV4Step(step));
};

export const v4RootLifecycle = (
  steps: readonly V4Step[]
): Readonly<{
  createRoots: ReadonlySet<string>;
  deleteRoots: ReadonlySet<string>;
}> => {
  const createRoots = new Set<string>();
  const deleteRoots = new Set<string>();

  for (const step of steps) {
    if (step.op === 'create_root') {
      if (deleteRoots.has(step.root)) {
        deleteRoots.delete(step.root);
      } else {
        createRoots.add(step.root);
      }
    } else if (step.op === 'delete_root') {
      if (createRoots.has(step.root)) {
        createRoots.delete(step.root);
      } else {
        deleteRoots.add(step.root);
      }
    }
  }

  return { createRoots, deleteRoots };
};

let v4BuilderFallbackDiffs = 0;

export const countV4BuilderFallbackDiff = () => {
  v4BuilderFallbackDiffs += 1;
};

export const readV4BuilderFallbackDiffs = () => v4BuilderFallbackDiffs;

export const resetV4BuilderFallbackDiffs = () => {
  v4BuilderFallbackDiffs = 0;
};
