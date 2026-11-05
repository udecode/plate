import type { NodeKey } from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import { profileCoreDuration } from '../profiling';
import { assertEditorJsonValue } from '../value-codec';
import { countCoreWork } from '../work';
import {
  type ChangedOutputRange,
  decodeNodes,
  DocumentIndex,
} from './document-index';
import {
  enclosureApplied,
  type PieceProps,
  rebaseOverPieces,
} from './enclosure';
import {
  convergedResult,
  liftOf,
  rebaseOverJoins,
  editsInMovedLine,
  rebaseOverLift,
} from './join';
import {
  cloneFrozen,
  cloneJson,
  isRecord,
  jsonEqual,
  type JsonRecord,
} from './json';
import { markReadBack, type ReadBack } from './read-back';
import {
  claimPreparedNodeSlice,
  closeToken,
  commonPrefixLength,
  commonSuffixLength,
  DOCUMENT_SLICE_PREPARED_NODES,
  getDocumentSliceNodeKeys,
  PreparedTokenSlice,
  isElementNode,
  isTextNode,
  type JsonNode,
  type JsonTextNode,
  type JsonToken,
  type JsonTokenData,
  nodeProps,
  openToken,
  pathKey,
  tokenLength,
  tokensEqual,
} from './tokens';
import {
  assertNodePropertyKey,
  canonicalJsonKey,
  clonePropertyModification,
  normalizeSetValues,
  type PropertyDeltaJson,
  type PropertyModification,
  type PropertyModificationJson,
  transformEarlierPropertyModifications,
  transformPathAfterRemove,
  unsafeNodePropertyKeys,
} from './transform';
import { crossed, wrapFidelity } from './wrap-fidelity';

/**
 * Concrete placement used to resolve schema-owned property laws.
 *
 * @internal
 */
export type DocumentPropertyContext = Readonly<{
  /** Element ancestors beyond the text parent, or including the element parent. */
  ancestors: readonly string[];
  parent: string | null;
  path: readonly number[];
  placement: 'element' | 'text';
  /** `null` addresses the implicit primary root. */
  root: string | null;
  /** Element type, or the parent type for text properties. */
  type: string;
}>;

/**
 * Resolve one property merge law at its concrete document location.
 *
 * @internal
 */
export type DocumentSetPropertyResolver = (
  node: JsonNode,
  key: string,
  context: DocumentPropertyContext
) => boolean;

export type RootChangeSection = {
  from: number;
  insert?: PreparedTokenSlice;
  /** Modify the properties of the node whose open token starts at `from`. */
  properties?: NodePropertyDelta;
  to?: number;
};

/**
 * An explicit node-property patch. `set` and `unset` replace scalar values;
 * `add` and `remove` treat array values as deterministic JSON sets.
 */
export type NodePropertyDelta = Readonly<{
  add?: Readonly<Record<string, readonly unknown[]>>;
  remove?: Readonly<Record<string, readonly unknown[]>>;
  set?: Readonly<JsonRecord>;
  unset?: readonly string[];
}>;

export type TrackMode = 'after' | 'around' | 'before';

export type KeptWrap = Readonly<{ props: Readonly<JsonRecord> }>;

export type RootChangeJson = ReadonlyArray<{
  length: number;
  properties?: PropertyDeltaJson;
  replacement?: readonly JsonTokenData[];
}>;

export const normalizePropertyDelta = (
  delta: NodePropertyDelta
): readonly PropertyModification[] => {
  assertEditorJsonValue(delta, 'Node property delta');

  if (!isRecord(delta)) throw new Error('Invalid node property delta.');

  const modifications: PropertyModification[] = [];
  const keyKinds = new Map<string, 'scalar' | 'set'>();
  const reserve = (key: string, kind: 'scalar' | 'set') => {
    assertNodePropertyKey(key);
    const existing = keyKinds.get(key);
    if (existing && (existing === 'scalar' || kind === 'scalar')) {
      throw new Error(`Node property delta repeats key ${key}.`);
    }
    keyKinds.set(key, kind);
  };

  if (delta.unset !== undefined) {
    if (!Array.isArray(delta.unset)) {
      throw new Error('Invalid node property delta.');
    }
    for (const key of [...delta.unset].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0
    )) {
      reserve(key, 'scalar');
      modifications.push(Object.freeze({ key, type: 'unset' }));
    }
  }

  if (delta.set !== undefined) {
    if (!isRecord(delta.set)) throw new Error('Invalid node property delta.');
    for (const key of Object.keys(delta.set).sort()) {
      reserve(key, 'scalar');
      modifications.push(
        clonePropertyModification({ key, type: 'set', value: delta.set[key] })
      );
    }
  }

  for (const type of ['remove', 'add'] as const) {
    const entries = delta[type];

    if (entries === undefined) continue;
    if (!isRecord(entries)) throw new Error('Invalid node property delta.');

    for (const key of Object.keys(entries).sort()) {
      const values = entries[key];

      reserve(key, 'set');
      if (!Array.isArray(values)) {
        throw new Error('Invalid node property delta.');
      }

      const normalized = normalizeSetValues(values);

      if (normalized.length > 0) {
        modifications.push(Object.freeze({ key, type, values: normalized }));
      }
    }
  }

  return Object.freeze(modifications);
};

export const applyPropertyModifications = (
  props: Readonly<JsonRecord>,
  modifications: readonly PropertyModification[]
) => {
  const next = { ...props };

  for (const modification of modifications) {
    const { key } = modification;

    if (modification.type === 'set') {
      next[key] = cloneFrozen(modification.value);
      continue;
    }
    if (modification.type === 'unset') {
      delete next[key];
      continue;
    }

    const current = Object.hasOwn(next, key) ? next[key] : undefined;

    if (current !== undefined && !Array.isArray(current)) {
      throw new Error(`Set-valued node property ${key} is not an array.`);
    }

    const currentValues = normalizeSetValues(
      (current as readonly unknown[] | undefined) ?? []
    );
    const values =
      modification.type === 'add'
        ? normalizeSetValues([...currentValues, ...modification.values])
        : normalizeSetValues(
            currentValues.filter(
              (value) =>
                !modification.values.some((item) => jsonEqual(item, value))
            )
          );

    if (values.length === 0) delete next[key];
    else next[key] = values;
  }

  return cloneFrozen(next);
};

export const semanticPropertyModifications = (
  before: Readonly<JsonRecord>,
  after: Readonly<JsonRecord>,
  isSetValued: (key: string) => boolean
) => {
  const modifications: PropertyModification[] = [];

  for (const key of [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ]
    .filter((innerKey) => !unsafeNodePropertyKeys.has(innerKey))
    .sort()) {
    if (!isSetValued(key)) {
      if (!Object.hasOwn(after, key)) {
        modifications.push(Object.freeze({ key, type: 'unset' }));
      } else if (
        !Object.hasOwn(before, key) ||
        !jsonEqual(before[key], after[key])
      ) {
        modifications.push(
          clonePropertyModification({ key, type: 'set', value: after[key] })
        );
      }
      continue;
    }

    const beforeValue = Object.hasOwn(before, key) ? before[key] : undefined;
    const afterValue = Object.hasOwn(after, key) ? after[key] : undefined;

    if (
      (beforeValue !== undefined && !Array.isArray(beforeValue)) ||
      (afterValue !== undefined && !Array.isArray(afterValue))
    ) {
      throw new Error(`Set-valued node property ${key} is not an array.`);
    }

    const previous = normalizeSetValues(
      (beforeValue as readonly unknown[] | undefined) ?? []
    );
    const next = normalizeSetValues(
      (afterValue as readonly unknown[] | undefined) ?? []
    );
    const removed = previous.filter(
      (value) => !next.some((item) => jsonEqual(item, value))
    );
    const added = next.filter(
      (value) => !previous.some((item) => jsonEqual(item, value))
    );

    if (removed.length > 0) {
      modifications.push(
        Object.freeze({ key, type: 'remove', values: removed })
      );
    }
    if (added.length > 0) {
      modifications.push(Object.freeze({ key, type: 'add', values: added }));
    }
  }

  return Object.freeze(modifications);
};

const isEmptyList = (value: unknown) =>
  Array.isArray(value) && value.length === 0;

const betweenPropertyModifications = (
  before: Readonly<JsonRecord>,
  after: Readonly<JsonRecord>,
  isSetValued: (key: string) => boolean,
  emptySetsAsValues = false
) =>
  semanticPropertyModifications(
    before,
    after,
    (key) =>
      isSetValued(key) &&
      !(
        emptySetsAsValues &&
        (isEmptyList(before[key]) || isEmptyList(after[key]))
      )
  );

export const invertPropertyModifications = (
  props: Readonly<JsonRecord>,
  modifications: readonly PropertyModification[]
) => {
  let current = cloneFrozen(props);
  const inverse: PropertyModification[] = [];

  for (const modification of modifications) {
    const { key } = modification;
    let inverted: PropertyModification | null;

    if (modification.type === 'set' || modification.type === 'unset') {
      inverted = Object.hasOwn(current, key)
        ? clonePropertyModification({ key, type: 'set', value: current[key] })
        : modification.type === 'set'
          ? Object.freeze({ key, type: 'unset' })
          : null;
    } else {
      const currentValue = Object.hasOwn(current, key)
        ? current[key]
        : undefined;

      if (currentValue !== undefined && !Array.isArray(currentValue)) {
        throw new Error(`Set-valued node property ${key} is not an array.`);
      }
      const currentValues = normalizeSetValues(
        (currentValue as readonly unknown[] | undefined) ?? []
      );
      const affected =
        modification.type === 'add'
          ? modification.values.filter(
              (value) => !currentValues.some((item) => jsonEqual(item, value))
            )
          : currentValues.filter((value) =>
              modification.values.some((item) => jsonEqual(item, value))
            );

      inverted =
        affected.length === 0
          ? null
          : Object.freeze({
              key,
              type: modification.type === 'add' ? 'remove' : 'add',
              values: normalizeSetValues(affected),
            });
    }

    current = applyPropertyModifications(current, [modification]);
    if (inverted) inverse.unshift(inverted);
  }

  return Object.freeze(inverse);
};

export const propertyModificationToJSON = (
  modification: PropertyModification
): PropertyModificationJson =>
  modification.type === 'set'
    ? {
        key: modification.key,
        type: modification.type,
        value: cloneJson(modification.value),
      }
    : modification.type === 'unset'
      ? { key: modification.key, type: modification.type }
      : {
          key: modification.key,
          type: modification.type,
          values: cloneJson(modification.values),
        };

export const propertyModificationFromJSON = (
  value: unknown
): PropertyModification => {
  if (!isRecord(value)) throw new Error('Invalid property delta JSON.');

  const { key, type } = value;

  assertNodePropertyKey(key);

  if (type === 'unset') {
    return Object.freeze({ key, type });
  }
  if (type === 'set' && Object.hasOwn(value, 'value')) {
    return clonePropertyModification({ key, type, value: value.value });
  }
  if ((type === 'add' || type === 'remove') && Array.isArray(value.values)) {
    const values = normalizeSetValues(value.values);

    if (values.length === 0) throw new Error('Invalid property delta JSON.');

    return Object.freeze({ key, type, values });
  }

  throw new Error('Invalid property delta JSON.');
};

export const propertyModificationsFromJSON = (value: unknown) => {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.operations)
  ) {
    throw new Error('Invalid property delta JSON.');
  }

  return Object.freeze(value.operations.map(propertyModificationFromJSON));
};

export const propertyDeltaFromModifications = (
  modifications: readonly PropertyModification[]
): NodePropertyDelta => {
  const add: Record<string, readonly unknown[]> = {};
  const remove: Record<string, readonly unknown[]> = {};
  const set: JsonRecord = {};
  const unset: string[] = [];

  for (const modification of modifications) {
    if (modification.type === 'set') {
      set[modification.key] = modification.value;
    } else if (modification.type === 'unset') {
      unset.push(modification.key);
    } else {
      (modification.type === 'add' ? add : remove)[modification.key] =
        modification.values;
    }
  }

  return Object.freeze({
    ...(Object.keys(add).length > 0 ? { add: Object.freeze(add) } : {}),
    ...(Object.keys(remove).length > 0
      ? { remove: Object.freeze(remove) }
      : {}),
    ...(Object.keys(set).length > 0 ? { set: Object.freeze(set) } : {}),
    ...(unset.length > 0 ? { unset: Object.freeze(unset) } : {}),
  });
};

export const applyPropertyModificationsToSlice = (
  slice: PreparedTokenSlice,
  modifications: readonly PropertyModification[]
) => {
  let changed = false;
  const tokens = slice.tokens.map((token): JsonToken => {
    if (token.kind !== 'open') return token;

    changed = true;

    return openToken(
      token.nodeKind,
      applyPropertyModifications(token.props, modifications)
    );
  });

  if (!changed) {
    throw new Error('Node property delta does not target an open node token.');
  }

  return PreparedTokenSlice.fromTokens(tokens);
};

export type SectionData =
  | PreparedTokenSlice
  | null
  | readonly PropertyModification[];
export type Replacement = {
  from: number;
  insert: PreparedTokenSlice;
  to: number;
};
export type PropertyChange = {
  from: number;
  modifications: readonly PropertyModification[];
  to: number;
};

export type ChangeSetApplyFallbackReason =
  | 'ambiguous-replacement-position'
  | 'invalid-property-target'
  | 'mixed-properties-and-replacements'
  | 'overlapping-replacement-range'
  | 'unresolved-local-replacement';

export type MutableChangeSetApplyWork = {
  ancestorPaths: number[][];
  fallbackReason: ChangeSetApplyFallbackReason | null;
  localizedReplacements: number;
};

export const CHANGE_SET_APPLY_STATS = new WeakMap<
  RootChange,
  Readonly<{
    ancestorPaths: ReadonlyArray<readonly number[]>;
    changedRanges: ReadonlyArray<
      Readonly<{
        fromAfter: number;
        fromBefore: number;
        toAfter: number;
        toBefore: number;
      }>
    >;
    fallbackReason: ChangeSetApplyFallbackReason | null;
    localizedReplacements: number;
    propertyChanges: number;
    replacements: number;
    usedTokenFallback: boolean;
  }>
>();

/**
 * Inspect the most recent apply strategy for one immutable change.
 *
 * @internal
 */
export const getRootChangeApplyStats = (change: RootChange) =>
  CHANGE_SET_APPLY_STATS.get(change) ?? null;

export class SectionIterator {
  private readonly data: readonly SectionData[];
  private readonly sections: readonly number[];

  index = 0;
  inserted = -3;
  length = 0;
  offset = 0;

  constructor(sections: readonly number[], data: readonly SectionData[]) {
    this.data = data;
    this.sections = sections;
    this.next();
  }

  get done() {
    return this.inserted === -3;
  }

  get keep() {
    return this.inserted === -1 || this.inserted === -2;
  }

  get outputLength() {
    return this.keep ? this.length : this.inserted;
  }

  /** The current section's index in the change's data. */
  get pair() {
    return (this.index - 2) >> 1;
  }

  get slice() {
    return (this.data[this.pair] ??
      PreparedTokenSlice.empty) as PreparedTokenSlice;
  }

  get modifications() {
    return this.inserted === -2
      ? (this.data[this.pair] as readonly PropertyModification[])
      : null;
  }

  forward(length: number) {
    if (length === this.length) {
      this.next();
    } else {
      this.length -= length;
      this.offset += length;
    }
  }

  forwardOutput(length: number) {
    if (this.keep) {
      this.forward(length);
    } else if (length === this.inserted) {
      this.next();
    } else {
      this.inserted -= length;
      this.offset += length;
    }
  }

  next() {
    if (this.index < this.sections.length) {
      this.length = getDefined(this.sections[this.index]);
      this.inserted = getDefined(this.sections[this.index + 1]);
      this.index += 2;
    } else {
      this.length = 0;
      this.inserted = -3;
    }

    this.offset = 0;
  }

  slicePart(length?: number) {
    return this.slice.slice(
      this.offset,
      length === undefined ? undefined : this.offset + length
    );
  }
}

const flushJoins = (data: SectionData[], joins: PreparedTokenSlice[]) => {
  if (joins.length === 0) return;

  const slices = [
    (data.at(-1) ?? PreparedTokenSlice.empty) as PreparedTokenSlice,
    ...joins,
  ];
  const filled = slices.filter((slice) => slice.length > 0);

  data[data.length - 1] =
    filled.length > 1
      ? PreparedTokenSlice.concat(filled)
      : (filled[0] ?? PreparedTokenSlice.empty);
  joins.length = 0;
};

export const addSection = (
  sections: number[],
  data: SectionData[],
  length: number,
  inserted: number,
  value: SectionData,
  forceJoin = false,
  joins?: PreparedTokenSlice[]
) => {
  if (length === 0 && inserted <= 0) return;

  const last = sections.length - 2;

  if (
    last >= 0 &&
    (inserted === -1 || inserted === 0) &&
    sections[last + 1] === inserted
  ) {
    sections[last] += length;
    return;
  }

  if (
    inserted >= 0 &&
    (forceJoin || (last >= 0 && length === 0 && sections[last] === 0))
  ) {
    sections[last] += length;
    sections[last + 1] += inserted;
    const slice = (value ?? PreparedTokenSlice.empty) as PreparedTokenSlice;

    if (joins) joins.push(slice);
    else {
      data[data.length - 1] = (
        (data.at(-1) ?? PreparedTokenSlice.empty) as PreparedTokenSlice
      ).concat(slice);
    }
    return;
  }
  if (joins) flushJoins(data, joins);

  sections.push(length, inserted);
  data.push(value);
};

export const composeSections = (
  sectionsA: readonly number[],
  dataA: readonly SectionData[],
  sectionsB: readonly number[],
  dataB: readonly SectionData[]
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  const joins: PreparedTokenSlice[] = [];
  const add = (
    length: number,
    inserted: number,
    value: SectionData,
    forceJoin: boolean
  ) => addSection(sections, data, length, inserted, value, forceJoin, joins);
  const a = new SectionIterator(sectionsA, dataA);
  const b = new SectionIterator(sectionsB, dataB);
  let open = false;

  for (;;) {
    if (a.done && b.done) {
      flushJoins(data, joins);

      return { data, sections };
    }

    if (a.inserted === 0) {
      add(a.length, 0, a.slice, open);
      a.next();
      continue;
    }

    if (b.length === 0 && !b.done) {
      add(0, b.inserted, b.slice, open);
      b.next();
      continue;
    }

    if (a.done || b.done) {
      throw new Error('Cannot compose mismatched change-set lengths.');
    }

    const length = Math.min(a.outputLength, b.length);
    const sectionLength = sections.length;

    if (a.keep && b.keep) {
      const modifications = Object.freeze([
        ...(a.modifications ?? []),
        ...(b.modifications ?? []),
      ]);

      add(
        length,
        modifications.length > 0 ? -2 : -1,
        modifications.length > 0 ? modifications : null,
        open
      );
    } else if (a.keep) {
      add(
        length,
        b.offset > 0 ? 0 : b.inserted,
        b.offset > 0 ? PreparedTokenSlice.empty : b.slice,
        open
      );
    } else if (b.keep) {
      const slice = a.slicePart(length);

      add(
        a.offset > 0 ? 0 : a.length,
        length,
        b.modifications
          ? applyPropertyModificationsToSlice(slice, b.modifications)
          : slice,
        open
      );
    } else {
      add(
        a.offset > 0 ? 0 : a.length,
        b.offset > 0 ? 0 : b.inserted,
        b.offset > 0 ? PreparedTokenSlice.empty : b.slice,
        open
      );
    }

    open =
      (a.inserted > length || (!b.keep && b.length > length)) &&
      (open || sections.length > sectionLength);
    a.forwardOutput(length);
    b.forward(length);
  }
};

/** Whether inserted tokens open an element they do not close: a wrap's lead. */
const opensEnclosure = (slice: PreparedTokenSlice | null) => {
  let depth = 0;

  for (const token of slice?.tokens ?? []) {
    if (token.kind === 'open') depth += 1;
    else if (token.kind === 'close') depth -= 1;
  }

  return depth > 0;
};

const tokenKey = (token: JsonToken) =>
  token.kind === 'open'
    ? ['open', token.nodeKind, token.props]
    : token.kind === 'close'
      ? ['close', token.nodeKind]
      : ['text', token.text];

const insertedElementKeys = ({ from, insert, to }: Replacement) => {
  if (from !== to) return undefined;

  const keys: string[] = [];
  let element: unknown[] = [];
  let depth = 0;

  for (const token of insert.tokens) {
    if (depth === 0) {
      if (token.kind !== 'open' || token.nodeKind !== 'element') {
        return undefined;
      }

      element = [];
    }

    element.push(tokenKey(token));
    depth += depthChange(token);

    if (depth === 0) keys.push(canonicalJsonKey(element));
  }

  return depth === 0 && keys.length > 0 ? keys : undefined;
};

const placesBlocks = (document: DocumentIndex, position: number) => {
  const context = document
    .openContextAt(position)
    .findLast(
      ({ contentFrom, contentTo }) =>
        contentFrom <= position && position <= contentTo
    );

  if (context === undefined) return true;
  if (context.kind !== 'element') return false;

  const node = document.node(context.path);
  const first = node && isElementNode(node) ? node.children[0] : undefined;
  const holdsInlineContent = first !== undefined && isTextNode(first);

  return !holdsInlineContent;
};

const removesElement = (
  document: DocumentIndex,
  replacements: readonly Replacement[]
) =>
  replacements.some(({ from, to }) => {
    let depth = 0;

    return document.slice(from, to).tokens.some((token) => {
      if (token.kind === 'open') depth += 1;
      if (token.kind !== 'close' || depth === 0) return false;

      depth -= 1;

      return token.nodeKind === 'element';
    });
  });

const sameSlice = (left: PreparedTokenSlice, right: PreparedTokenSlice) =>
  left.length === right.length &&
  left.tokens.every((token, index) => tokensEqual(token, right.tokens[index]));

const netDepth = (tokens: readonly JsonToken[]) =>
  tokens.reduce((depth, token) => depth + depthChange(token), 0);

const editedRanges = (change: RootChange, side: 'from' | 'to') => {
  const ranges: Array<readonly [number, number]> = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const size = side === 'to' && inserted >= 0 ? inserted : length;

    if (inserted !== -1) ranges.push([position, position + size]);
    position += size;
  }

  return ranges;
};

/** Whether every edit `change` made to give `result` is still in `later`. */
const keptIn = (
  change: RootChange,
  result: DocumentIndex,
  later: DocumentIndex
) => {
  const written = editedRanges(change, 'to');

  return editedRanges(RootChange.between(result, later), 'from').every(
    ([from, to]) => written.every(([start, end]) => to < start || end < from)
  );
};

/**
 * An edit both sides make at one place: the same edit, or different blocks
 * both kept, the first side's first.
 */
type SharedEdit = Readonly<
  { from: number; merged: PreparedTokenSlice; to: number } & (
    | { kind: 'same' }
    | {
        first: PreparedTokenSlice;
        kind: 'different';
        second: PreparedTokenSlice;
      }
  )
>;

const editKey = (from: number, to: number) => `${from}:${to}`;

/**
 * The places where both sides insert whole blocks between blocks, by
 * `editKey`. The same blocks count once, with each other edit both sides make
 * alike, and different blocks both stay. Null when there is no such place,
 * when two inserts there share blocks but not all of them in order, when
 * the same blocks go in while a side takes an element out, as a move does,
 * or when both sides also wrap letters, which the rebase decides as a pair.
 */
const sharedPlaceEdits = (
  document: DocumentIndex,
  aReplacements: readonly Replacement[],
  bReplacements: readonly Replacement[]
) => {
  const bByRange = new Map(
    bReplacements.map((replacement) => [
      editKey(replacement.from, replacement.to),
      replacement,
    ])
  );
  const blocks: SharedEdit[] = [];
  const alike: SharedEdit[] = [];
  let sameBlocks = false;
  let removes: boolean | undefined;

  for (const replacement of aReplacements) {
    const { from, insert, to } = replacement;
    const other = bByRange.get(editKey(from, to));

    if (!other) continue;

    const keys = insertedElementKeys(replacement);
    const otherKeys = insertedElementKeys(other);

    if (!keys || !otherKeys || !placesBlocks(document, from)) {
      if (
        sameSlice(insert, other.insert) &&
        netDepth(insert.tokens) === netDepth(document.slice(from, to).tokens)
      ) {
        alike.push({ from, kind: 'same', merged: insert, to });
      }
      continue;
    }

    const otherKeySet = new Set(otherKeys);
    const common = keys.filter((key) => otherKeySet.has(key)).length;

    if (common === 0) {
      blocks.push({
        first: insert,
        from,
        kind: 'different',
        merged: insert.concat(other.insert),
        second: other.insert,
        to,
      });
      continue;
    }
    if (
      keys.length !== otherKeys.length ||
      keys.some((key, index) => key !== otherKeys[index])
    ) {
      return null;
    }

    removes ??= removesElement(document, [...aReplacements, ...bReplacements]);

    if (removes) return null;

    sameBlocks = true;
    blocks.push({ from, kind: 'same', merged: insert, to });
  }

  if (blocks.length === 0) return null;

  const edits = new Map(
    [...blocks, ...(sameBlocks ? alike : [])].map((edit) => [
      editKey(edit.from, edit.to),
      edit,
    ])
  );
  const wraps = (replacements: readonly Replacement[]) =>
    replacements.some(
      ({ from, insert, to }) =>
        !edits.has(editKey(from, to)) && opensEnclosure(insert)
    );

  return wraps(aReplacements) && wraps(bReplacements) ? null : edits;
};

const overSharedEdits = (
  change: RootChange,
  edits: ReadonlyMap<string, SharedEdit>
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const edit =
      inserted >= 0 ? edits.get(editKey(position, position + length)) : null;

    if (edit) addSection(sections, data, edit.merged.length, -1, null);
    else addSection(sections, data, length, inserted, change.data[index >> 1]);

    position += length;
  }

  return RootChange.fromSections(sections, data);
};

/**
 * Adds the other side's blocks beside `change`'s own at each place both
 * insert different ones.
 */
const resultToSharedDocument = (
  change: RootChange,
  edits: ReadonlyMap<string, SharedEdit>,
  side: 'first' | 'second'
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const edit =
      inserted >= 0 ? edits.get(editKey(position, position + length)) : null;
    const different = edit?.kind === 'different' ? edit : null;
    const before = side === 'second' ? different?.first : null;
    const after = side === 'first' ? different?.second : null;

    if (before) addSection(sections, data, 0, before.length, before);
    addSection(sections, data, inserted < 0 ? length : inserted, -1, null);
    if (after) addSection(sections, data, 0, after.length, after);

    position += length;
  }

  return RootChange.fromSections(sections, data);
};

/**
 * A replayed change's sections, with the whole blocks and element closes that
 * start an insert split off as an insert of their own when those closes end
 * elements the change wrapped around content, or that its base already closed
 * there. `ownCloses` holds the data index of each such insert.
 */
type ReplaySections = {
  readonly data: readonly SectionData[];
  readonly ownCloses: ReadonlySet<number>;
  readonly sections: readonly number[];
};

const replaySections = new WeakMap<
  RootChange,
  WeakMap<DocumentIndex, ReplaySections>
>();

const leadingNodeTokens = (tokens: readonly JsonToken[], from = 0) => {
  let depth = 0;
  let at = from;

  for (; at < tokens.length; at++) {
    const token = getDefined(tokens[at]);

    if (depth === 0 && !isElementOpen(token)) break;
    if (token.kind === 'open') depth += 1;
    else if (token.kind === 'close') depth -= 1;
  }

  return at - from;
};

const insertsWhere = (
  change: RootChange,
  passes: (tokens: readonly JsonToken[]) => boolean
) => {
  const positions: number[] = [];
  let position = 0;

  for (let at = 0; at < change.sections.length; at += 2) {
    const length = getDefined(change.sections[at]);
    const inserted = getDefined(change.sections[at + 1]);

    if (
      length === 0 &&
      inserted > 0 &&
      passes((change.data[at >> 1] as PreparedTokenSlice).tokens)
    ) {
      positions.push(position);
    }
    position += length;
  }

  return positions;
};

const isElementClose = (token: JsonToken | undefined) =>
  token?.kind === 'close' && token.nodeKind === 'element';

const isElementOpen = (token: JsonToken | undefined) =>
  token?.kind === 'open' && token.nodeKind === 'element';

const closesAfterNodes = (tokens: readonly JsonToken[]) =>
  isElementClose(tokens[leadingNodeTokens(tokens)]);

const meetsNodesAtClose = (change: RootChange, other: RootChange) => {
  const closes = insertsWhere(change, closesAfterNodes);

  if (closes.length === 0) return false;

  const nodes = new Set(
    insertsWhere(other, (tokens) => isElementOpen(tokens[0]))
  );

  return closes.some((position) => nodes.has(position));
};

type Continued = {
  readonly closesAt: number;
  readonly everyCloseDeleted: boolean;
};

type OutputElement = {
  readonly continued: Continued | null;
  /** Node kind and type, or kind and `*` when a property change may have retyped it. */
  readonly key: string;
  readonly kind: string;
};

type DeletedOpens = { keptCloses: number; readonly opens: number[] };

/** An element the output cut, until an open continues it. */
type CutElement = { readonly continued: Continued; taken: boolean };

const openKind = (token: JsonToken) =>
  token.kind === 'open' ? token.nodeKind : '';

const nodeKey = (token: JsonToken) =>
  `${openKind(token)}:${String(token.kind === 'open' ? token.props.type : '')}`;

const documentCloses = (change: RootChange, document: DocumentIndex) => {
  const base = document.tokens.tokens;
  const { offsets } = document.tokens;
  const closeOf = new Map<number, number>();
  const deleted = new Uint8Array(base.length);
  const opens: number[] = [];

  for (let at = 0; at < base.length; at++) {
    const { kind } = getDefined(base[at]);

    if (kind === 'open') opens.push(at);
    else if (kind === 'close') closeOf.set(getDefined(opens.pop()), at);
  }

  let at = 0;
  let position = 0;
  let written: JsonToken | undefined;

  for (let pair = 0; pair < change.sections.length; pair += 2) {
    const length = getDefined(change.sections[pair]);
    const inserted = getDefined(change.sections[pair + 1]);
    const tokens =
      inserted > 0 ? (change.data[pair >> 1] as PreparedTokenSlice).tokens : [];
    let writesClose = isElementClose(
      length > 0 && inserted > 0 ? tokens.at(-1) : written
    );

    for (
      ;
      at < base.length && getDefined(offsets[at]) < position + length;
      at++
    ) {
      if (inserted >= 0 && !(writesClose && isElementClose(base[at]))) {
        deleted[at] = 1;
      }
      writesClose = false;
    }
    written = length === 0 ? tokens.at(-1) : undefined;
    position += length;
  }

  countCoreWork('replayWalkVisits', base.length);

  const closeAt = (open: number) => getDefined(closeOf.get(open));

  return {
    closeAt,
    closeDeleted: (open: number) => deleted[closeAt(open)] === 1,
  };
};

const splitOwnCloses = (
  change: RootChange,
  document: DocumentIndex
): ReplaySections => {
  const base = document.tokens.tokens;
  const { offsets } = document.tokens;
  const sections: number[] = [];
  const data: SectionData[] = [];
  const ownCloses = new Set<number>();
  const baseOpen: number[] = [];
  const outputOpen: OutputElement[] = [];
  // Elements the output has closed while a document element they continue
  // stays open, by key and by node kind, so a later open of the same node
  // continues one, as after a split or a lift.
  const cut = new Map<string, CutElement[]>();
  let retypeCandidates = new Set<number>();
  const paired = new Set<number>();
  const deletedByKind = new Map<string, DeletedOpens>();
  const { closeAt, closeDeleted } = documentCloses(change, document);
  let token = 0;
  let position = 0;

  const stillOpen = (continued: Continued | null) =>
    continued !== null && continued.closesAt >= token;

  const lastCut = (key: string) => {
    const elements = cut.get(key) ?? [];
    let last = elements.at(-1);

    countCoreWork('replayWalkVisits');
    while (last && (last.taken || !stillOpen(last.continued))) {
      countCoreWork('replayWalkVisits');
      elements.pop();
      last = elements.at(-1);
    }

    return last;
  };

  const continues = (written: JsonToken) => {
    const typed = lastCut(nodeKey(written));

    if (typed) return typed;

    const any = lastCut(`${openKind(written)}:*`);

    if (any) return any;

    const last = lastCut(openKind(written));

    return last?.continued.everyCloseDeleted ? last : undefined;
  };

  const unmatchedOpens = (from: number, to: number) => {
    const opens: number[] = [];
    let at = from;

    for (; at < base.length && getDefined(offsets[at]) < to; at++) {
      const { kind } = getDefined(base[at]);

      if (kind === 'open') opens.push(at);
      else if (kind === 'close') opens.pop();
    }
    countCoreWork('replayWalkVisits', at - from);

    return opens;
  };

  for (let at = 0; at < change.sections.length; at += 2) {
    const length = getDefined(change.sections[at]);
    const inserted = getDefined(change.sections[at + 1]);
    const value = change.data[at >> 1] ?? null;
    let split = 0;

    if (inserted < 0) retypeCandidates = new Set();

    if (length === 0 && inserted > 0) {
      const { tokens } = value as PreparedTokenSlice;
      let closed = 0;
      let next = 0;

      for (;;) {
        const nodes = next + leadingNodeTokens(tokens, next);
        let own = 0;

        while (isElementClose(tokens[nodes + own])) {
          const element = outputOpen.at(-1 - closed - own);

          if (element === undefined || stillOpen(element.continued)) break;
          own += 1;
        }
        if (own === 0) break;
        closed += own;
        next = nodes + own;
      }
      if (next > 0) {
        split = (value as PreparedTokenSlice).offsets[next] ?? inserted;
      }
    }

    if (split > 0) {
      const slice = value as PreparedTokenSlice;

      ownCloses.add(data.length);
      sections.push(0, split);
      data.push(slice.slice(0, split));
      if (inserted > split) {
        sections.push(0, inserted - split);
        data.push(slice.slice(split));
      }
    } else if (length > 0 || inserted > 0) {
      sections.push(length, inserted);
      data.push(value);
    }

    countCoreWork('replayWalkVisits', Math.max(inserted, 0));
    for (
      ;
      token < base.length && getDefined(offsets[token]) < position + length;
      token++
    ) {
      const written = getDefined(base[token]);

      if (written.kind === 'open') {
        baseOpen.push(token);
        if (inserted < 0) {
          outputOpen.push({
            continued: {
              closesAt: closeAt(token),
              everyCloseDeleted: closeDeleted(token),
            },
            key: inserted === -1 ? nodeKey(written) : `${openKind(written)}:*`,
            kind: openKind(written),
          });
        } else {
          const kind = openKind(written);
          const sameKind = deletedByKind.get(kind) ?? {
            keptCloses: 0,
            opens: [],
          };

          sameKind.opens.push(token);
          if (!closeDeleted(token)) sameKind.keptCloses += 1;
          deletedByKind.set(kind, sameKind);
          if (!paired.has(token)) retypeCandidates.add(token);
        }
      } else if (written.kind === 'close') {
        const open = getDefined(baseOpen.pop());
        const sameKind = deletedByKind.get(openKind(getDefined(base[open])));

        retypeCandidates.delete(open);
        if (sameKind?.opens.at(-1) === open) {
          sameKind.opens.pop();
          if (!closeDeleted(open)) sameKind.keptCloses -= 1;
        }
        if (inserted < 0) outputOpen.pop();
      }
    }

    if (inserted > 0) {
      const next = change.sections[at + 2] ?? 0;

      if (next > 0 && change.sections[at + 3] === 0) {
        for (const open of unmatchedOpens(token, position + length + next)) {
          retypeCandidates.add(open);
          paired.add(open);
        }
      }

      const opened: number[] = [];

      for (const written of (value as PreparedTokenSlice).tokens) {
        if (written.kind === 'open') {
          const from = continues(written);

          if (from) from.taken = true;
          opened.push(outputOpen.length);
          outputOpen.push({
            continued: from?.continued ?? null,
            key: nodeKey(written),
            kind: openKind(written),
          });
        } else if (written.kind === 'close') {
          const element = getDefined(outputOpen.pop());

          if (opened.at(-1) === outputOpen.length) opened.pop();
          if (element.continued && stillOpen(element.continued)) {
            const cutElement = { continued: element.continued, taken: false };

            for (const key of [element.key, element.kind]) {
              const elements = cut.get(key) ?? [];

              elements.push(cutElement);
              cut.set(key, elements);
            }
          }
        }
      }

      const wraps = opened.filter(
        (index) => getDefined(outputOpen[index]).continued === null
      );

      if (wraps.length > 0) {
        let retypeClosesAt = -1;
        let retypeClosesDeleted = true;

        countCoreWork('replayWalkVisits', retypeCandidates.size);
        for (const open of retypeCandidates) {
          retypeClosesAt = Math.max(retypeClosesAt, closeAt(open));
          retypeClosesDeleted &&= closeDeleted(open);
        }
        for (const index of wraps) {
          const element = getDefined(outputOpen[index]);
          const sameKind = deletedByKind.get(element.kind);
          const outermost = sameKind?.opens[0];
          const closesAt = Math.max(
            retypeClosesAt,
            outermost === undefined ? -1 : closeAt(outermost)
          );

          if (closesAt < 0) continue;
          outputOpen[index] = {
            ...element,
            continued: {
              closesAt,
              everyCloseDeleted:
                retypeClosesDeleted && (sameKind?.keptCloses ?? 0) === 0,
            },
          };
        }
        retypeCandidates = new Set();
      }
    }

    position += length;
  }

  return { data, ownCloses, sections };
};

const replaySectionsOf = (
  change: RootChange,
  other: RootChange,
  document: DocumentIndex
) => {
  if (!meetsNodesAtClose(change, other)) return null;

  let byDocument = replaySections.get(change);

  if (!byDocument) {
    byDocument = new WeakMap();
    replaySections.set(change, byDocument);
  }

  let split = byDocument.get(document);

  if (!split) {
    split = splitOwnCloses(change, document);
    byDocument.set(document, split);
  }

  return split;
};

const landing = { beforePeer: -1, tie: 0, afterPeer: 1 } as const;

const landingOrder = (
  side: SectionIterator,
  ownCloses: ReadonlySet<number> | undefined,
  other: SectionIterator,
  otherLeftOpen: boolean
) => {
  if (
    ownCloses?.has(side.pair) &&
    !otherLeftOpen &&
    other.slice.tokens.length > 0 &&
    leadingNodeTokens(other.slice.tokens) === other.slice.tokens.length
  ) {
    return landing.beforePeer;
  }

  return opensEnclosure(side.slice) ? landing.afterPeer : landing.tie;
};

/**
 * Whether `b`'s insertion goes before `a`'s at one position. A replayed insert
 * split off as own lands before the other side's whole blocks, unless the
 * other side's insert just before it here left an element open. Content one
 * side inserts at the lead of an element the other wraps stays outside it, as
 * it was before the wrap; otherwise `before` breaks the tie.
 */
const bLandsFirst = (
  a: SectionIterator,
  b: SectionIterator,
  ownA: ReadonlySet<number> | undefined,
  ownB: ReadonlySet<number> | undefined,
  before: boolean,
  leftOpen: 'a' | 'b' | null
) => {
  const aOrder = landingOrder(a, ownA, b, leftOpen === 'b');
  const bOrder = landingOrder(b, ownB, a, leftOpen === 'a');

  return aOrder === bOrder ? !before : bOrder < aOrder;
};

export const transformChange = (
  changeA: RootChange,
  changeB: RootChange,
  before: boolean,
  replayBase?: DocumentIndex,
  readBack: ReadBack | null = null
) => {
  if (changeA.length !== changeB.length) {
    throw new Error('Cannot transform mismatched change-set lengths.');
  }

  const sections: number[] = [];
  const data: SectionData[] = [];
  const fidelity =
    readBack && replayBase
      ? wrapFidelity(changeA, changeB, replayBase, before ? 'a' : 'b')
      : null;

  if (fidelity) markReadBack(readBack);
  const replayA =
    !fidelity && replayBase && replaySectionsOf(changeA, changeB, replayBase);
  const replayB =
    !fidelity && replayBase && replaySectionsOf(changeB, changeA, replayBase);
  const a = new SectionIterator(
    fidelity
      ? fidelity.a.sections
      : replayA
        ? replayA.sections
        : changeA.sections,
    fidelity ? fidelity.a.data : replayA ? replayA.data : changeA.data
  );
  const b = new SectionIterator(
    fidelity
      ? fidelity.b.sections
      : replayB
        ? replayB.sections
        : changeB.sections,
    fidelity ? fidelity.b.data : replayB ? replayB.data : changeB.data
  );
  let inserted = -1;
  let position = 0;
  let leftOpen: 'a' | 'b' | null = null;

  for (;;) {
    if (a.keep && b.keep) {
      const length = Math.min(a.length, b.length);

      if (length > 0) leftOpen = null;
      const modifications = a.modifications
        ? before
          ? transformEarlierPropertyModifications(
              a.modifications,
              b.modifications ?? []
            )
          : a.modifications
        : null;

      addSection(
        sections,
        data,
        length,
        modifications && modifications.length > 0 ? -2 : -1,
        modifications && modifications.length > 0 ? modifications : null
      );
      a.forward(length);
      b.forward(length);
      position += length;
      continue;
    }

    if (
      b.inserted >= 0 &&
      (a.inserted < 0 ||
        inserted === a.index ||
        (a.offset === 0 &&
          (b.length < a.length ||
            (b.length === a.length &&
              (a.length === 0
                ? fidelity?.merges(position)
                  ? fidelity.bFirst(position)
                  : bLandsFirst(
                      a,
                      b,
                      replayA ? replayA.ownCloses : undefined,
                      replayB ? replayB.ownCloses : undefined,
                      before,
                      leftOpen
                    )
                : !before)))))
    ) {
      const end = position + b.length;

      addSection(sections, data, b.inserted, -1, null);
      if (replayBase && b.inserted > 0) {
        leftOpen = opensEnclosure(b.slice) ? 'b' : null;
      }

      while (position < end) {
        if (a.done) throw new Error('Mismatched transformed change sets.');

        const piece = Math.min(a.length, end - position);

        if (a.inserted >= 0 && inserted < a.index && a.length <= piece) {
          addSection(sections, data, 0, a.inserted, a.slice);
          inserted = a.index;
          if (replayBase && a.inserted > 0) {
            leftOpen = opensEnclosure(a.slice) ? 'a' : null;
          }
        }

        a.forward(piece);
        position += piece;
      }

      b.next();
      continue;
    }

    if (a.inserted >= 0) {
      const start = position;
      const end = position + a.length;
      let length = 0;

      while (position < end) {
        if (b.keep) {
          const piece = Math.min(end - position, b.length);

          position += piece;
          length += piece;
          b.forward(piece);
        } else if (b.inserted === 0) {
          const piece = Math.min(end - position, b.length);

          position += piece;
          b.forward(piece);
        } else {
          break;
        }
      }

      if (inserted < a.index) {
        addSection(sections, data, length, a.inserted, a.slice);
        inserted = a.index;
        if (replayBase && a.inserted > 0) {
          leftOpen = opensEnclosure(a.slice) ? 'a' : null;
        }
      } else {
        addSection(sections, data, length, 0, PreparedTokenSlice.empty);
      }

      a.forward(position - start);
      continue;
    }

    return RootChange.fromSections(sections, data);
  }
};

export const getDocumentPropertyContext = (
  document: DocumentIndex,
  path: readonly number[],
  root: string | null
): DocumentPropertyContext => {
  const node = document.node(path);
  const ancestorTypes: string[] = [];

  for (let depth = path.length - 1; depth > 0; depth--) {
    const ancestor = document.node(path.slice(0, depth));

    if (!isTextNode(ancestor)) {
      ancestorTypes.push(
        typeof ancestor.type === 'string' ? ancestor.type : 'element'
      );
    }
  }

  const placement = isTextNode(node) ? 'text' : 'element';
  const parent = ancestorTypes[0] ?? null;

  return Object.freeze({
    ancestors: placement === 'text' ? ancestorTypes.slice(1) : ancestorTypes,
    parent,
    path: Object.freeze([...path]),
    placement,
    root,
    type:
      placement === 'text'
        ? (parent ?? 'text')
        : typeof node.type === 'string'
          ? node.type
          : 'element',
  });
};

/** @internal */
export const writesOnlyElementProperties = (
  change: RootChange,
  document: DocumentIndex
) => {
  let position = 0;

  for (let at = 0; at < change.sections.length; at += 2) {
    const inserted = getDefined(change.sections[at + 1]);

    if (inserted >= 0) return false;
    if (
      inserted === -2 &&
      document.nodeStartingAt(position)?.kind !== 'element'
    ) {
      return false;
    }
    position += getDefined(change.sections[at]);
  }

  return true;
};

/** @internal */
export const collapseElementPropertyWrites = (
  change: RootChange,
  document: DocumentIndex,
  isSetValued: DocumentSetPropertyResolver,
  root: string | null,
  text = false
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let applied: DocumentIndex | undefined;
  let position = 0;
  let appliedPosition = 0;
  let collapsed = false;
  const appliedAt = (at: number) => {
    applied ??= change.apply(document);
    const { path } = getDefined(applied.nodeStartingAt(at));

    return [
      applied.node(path),
      getDocumentPropertyContext(applied, path, root),
    ] as const;
  };

  for (let at = 0; at < change.sections.length; at += 2) {
    const length = getDefined(change.sections[at]);
    const inserted = getDefined(change.sections[at + 1]);
    const value = change.data[at / 2] ?? null;
    const entry =
      inserted === -2 ? document.nodeStartingAt(position) : undefined;

    if (entry?.kind === 'element' || (text && entry?.kind === 'text')) {
      const node = document.node(entry.path);
      const modifications = value as readonly PropertyModification[];
      const keys = new Set(modifications.map(({ key }) => key));
      const written = Object.fromEntries(
        Object.entries(nodeProps(node)).filter(([key]) => keys.has(key))
      );
      const context = getDocumentPropertyContext(document, entry.path, root);
      const start = appliedPosition;
      let after: ReturnType<typeof appliedAt> | undefined;
      const kept = semanticPropertyModifications(
        written,
        applyPropertyModifications(written, modifications),
        (key) => {
          if (!isSetValued(node, key, context)) return false;

          after ??= appliedAt(start);

          return isSetValued(after[0], key, after[1]);
        }
      );

      addSection(
        sections,
        data,
        length,
        kept.length > 0 ? -2 : -1,
        kept.length > 0 ? kept : null
      );
      collapsed = true;
    } else {
      addSection(sections, data, length, inserted, value);
    }
    position += length;
    appliedPosition += inserted < 0 ? length : inserted;
  }

  return collapsed ? RootChange.fromSections(sections, data) : change;
};

export const TREE_DIFF_MATRIX_LIMIT = 4096;
export const TREE_DIFF_TEXT_BOUNDARY = 128;

export type NodeTextBoundary = Readonly<{
  length: number;
  prefix: string;
  suffix: string;
}>;

export const commonTextPrefixLength = (left: string, right: string) => {
  const limit = Math.min(left.length, right.length);
  let length = 0;

  while (length < limit && left[length] === right[length]) length += 1;

  return length;
};

export const commonTextSuffixLength = (
  left: string,
  right: string,
  limit = Math.min(left.length, right.length)
) => {
  let length = 0;

  while (length < limit && left.at(-length - 1) === right.at(-length - 1)) {
    length += 1;
  }

  return length;
};

/**
 * Build a structural diff when unchanged siblings shift or one source node has
 * a uniquely stronger continuation later in its sibling list. Flat diffs can
 * otherwise retain an opening token on one inserted sibling and that node's
 * content/closing token on another, splitting one node key in two.
 */
export const createStructurallyAlignedChanges = (
  before: DocumentIndex,
  after: DocumentIndex,
  options: Readonly<{
    emptySetsAsValues?: boolean;
    isSetValued?: DocumentSetPropertyResolver;
    root?: string | null;
  }>
) => {
  const changes: RootChangeSection[] = [];
  const boundaries = new WeakMap<JsonNode, NodeTextBoundary>();
  const properties = new WeakMap<JsonNode, Readonly<JsonRecord>>();
  let flatDiffRekeys = false;

  const getProperties = (node: JsonNode) => {
    let result = properties.get(node);

    if (!result) {
      result = nodeProps(node);
      properties.set(node, result);
    }

    return result;
  };
  const getBoundary = (node: JsonNode): NodeTextBoundary => {
    const cached = boundaries.get(node);

    if (cached) return cached;

    if (isTextNode(node)) {
      const result = Object.freeze({
        length: node.text.length,
        prefix: node.text.slice(0, TREE_DIFF_TEXT_BOUNDARY),
        suffix: node.text.slice(-TREE_DIFF_TEXT_BOUNDARY),
      });

      boundaries.set(node, result);

      return result;
    }

    let length = 0;
    let prefix = '';
    let suffix = '';

    for (const child of node.children) {
      const childBoundary = getBoundary(child);

      length += childBoundary.length;
      if (prefix.length < TREE_DIFF_TEXT_BOUNDARY) {
        prefix += childBoundary.prefix.slice(
          0,
          TREE_DIFF_TEXT_BOUNDARY - prefix.length
        );
      }
    }
    for (let index = node.children.length - 1; index >= 0; index--) {
      const childBoundary = getBoundary(node.children[index]);

      suffix = `${childBoundary.suffix.slice(
        Math.max(
          0,
          childBoundary.suffix.length -
            (TREE_DIFF_TEXT_BOUNDARY - suffix.length)
        )
      )}${suffix}`;
      if (suffix.length >= TREE_DIFF_TEXT_BOUNDARY) break;
    }

    const result = Object.freeze({ length, prefix, suffix });

    boundaries.set(node, result);

    return result;
  };
  const continuityScore = (source: JsonNode, target: JsonNode) => {
    if (isTextNode(source) !== isTextNode(target)) return 0;
    if (Object.is(source, target)) return 2_000_000_000;
    if (jsonEqual(source, target)) return 1_000_000_000;

    const sourceProperties = getProperties(source);
    const targetProperties = getProperties(target);
    const propertiesEqual = jsonEqual(sourceProperties, targetProperties);
    const sourceType = sourceProperties.type;
    const targetType = targetProperties.type;

    if (
      !propertiesEqual &&
      (sourceType === undefined || sourceType !== targetType)
    ) {
      return 0;
    }

    const sourceText = getBoundary(source);
    const targetText = getBoundary(target);
    const prefix = commonTextPrefixLength(sourceText.prefix, targetText.prefix);
    const suffix = commonTextSuffixLength(
      sourceText.suffix,
      targetText.suffix,
      Math.max(0, Math.min(sourceText.length, targetText.length) - prefix)
    );
    const overlap = prefix + suffix;

    if (overlap === 0) return 0;

    return (propertiesEqual ? 1024 : 512) + overlap * 16;
  };
  const isCompleteTextContinuation = (source: JsonNode, target: JsonNode) => {
    const sourceText = getBoundary(source);

    if (
      sourceText.length === 0 ||
      sourceText.length > TREE_DIFF_TEXT_BOUNDARY
    ) {
      return false;
    }

    const targetText = getBoundary(target);
    const prefix = commonTextPrefixLength(sourceText.prefix, targetText.prefix);
    const suffix = commonTextSuffixLength(
      sourceText.suffix,
      targetText.suffix,
      Math.max(0, Math.min(sourceText.length, targetText.length) - prefix)
    );

    return prefix + suffix === sourceText.length;
  };
  const addPropertyChanges = (
    source: JsonNode,
    target: JsonNode,
    path: readonly number[]
  ) => {
    const sourceProperties = getProperties(source);
    const targetProperties = getProperties(target);

    if (jsonEqual(sourceProperties, targetProperties)) return;

    const context = getDocumentPropertyContext(
      before,
      path,
      options.root ?? null
    );
    const modifications = betweenPropertyModifications(
      sourceProperties,
      targetProperties,
      (key) => options.isSetValued?.(source, key, context) ?? false,
      options.emptySetsAsValues
    );

    if (modifications.length > 0) {
      changes.push({
        from: before.nodeRange(path).from,
        properties: propertyDeltaFromModifications(modifications),
      });
    }
  };
  const diffNode = (
    source: JsonNode,
    target: JsonNode,
    path: readonly number[]
  ) => {
    if (jsonEqual(source, target)) return true;
    if (isTextNode(source) !== isTextNode(target)) return false;

    addPropertyChanges(source, target, path);

    if (isTextNode(source) && isTextNode(target)) {
      const range = before.nodeRange(path);
      const prefix = commonTextPrefixLength(source.text, target.text);
      const suffix = commonTextSuffixLength(
        source.text,
        target.text,
        Math.min(source.text.length, target.text.length) - prefix
      );

      if (prefix !== source.text.length || prefix !== target.text.length) {
        changes.push({
          from: range.from + 1 + prefix,
          insert: PreparedTokenSlice.text(
            target.text.slice(prefix, target.text.length - suffix)
          ),
          to: range.to - 1 - suffix,
        });
      }

      return true;
    }
    if (!isElementNode(source) || !isElementNode(target)) return false;

    // A flat diff replaces an element whose properties and children both
    // change, though it keeps its type.
    if (
      getProperties(source).type === getProperties(target).type &&
      !jsonEqual(getProperties(source), getProperties(target)) &&
      !jsonEqual(source.children, target.children)
    ) {
      flatDiffRekeys = true;
    }

    return diffChildren(source.children, target.children, path);
  };
  const diffChildren = (
    source: readonly JsonNode[],
    target: readonly JsonNode[],
    parentPath: readonly number[]
  ): boolean => {
    let prefix = 0;

    while (
      prefix < source.length &&
      prefix < target.length &&
      jsonEqual(source[prefix], target[prefix])
    ) {
      prefix += 1;
    }

    let suffix = 0;

    while (
      suffix < source.length - prefix &&
      suffix < target.length - prefix &&
      jsonEqual(source.at(-suffix - 1), target.at(-suffix - 1))
    ) {
      suffix += 1;
    }

    const sourceEnd = source.length - suffix;
    const targetEnd = target.length - suffix;
    const sourceCount = sourceEnd - prefix;
    const targetCount = targetEnd - prefix;

    if (
      suffix > 0 &&
      sourceCount !== targetCount &&
      (sourceCount === 0 || targetCount === 0)
    ) {
      flatDiffRekeys = true;
    }

    if (sourceCount > 0 && targetCount > 0 && sourceCount !== targetCount) {
      const sourceRun = source.slice(prefix, sourceEnd);
      const targetRun = target.slice(prefix, targetEnd);

      if (
        sourceRun.every(isTextNode) &&
        targetRun.every(isTextNode) &&
        sourceRun.map((node) => node.text).join('') ===
          targetRun.map((node) => node.text).join('')
      ) {
        // Retain the characters: replacing the run would remap interior
        // selections. A source leaf boundary stays where a target leaf starts
        // and merges away elsewhere, and a target leaf that starts inside a
        // source leaf splits it.
        const startsOf = (run: readonly JsonTextNode[]) => {
          let offset = 0;

          return run.map((node) => {
            const at = offset;

            offset += node.text.length;
            return at;
          });
        };
        const sourceStarts = startsOf(sourceRun);
        const targetStarts = startsOf(targetRun);
        let next = 1;
        const splitAt = (targetIndex: number) => {
          const offset = getDefined(targetStarts[targetIndex]);
          const index = sourceStarts.findLastIndex((at) => at <= offset);

          changes.push({
            from: before.positionAt({
              path: [...parentPath, prefix + index],
              offset: offset - getDefined(sourceStarts[index]),
            }),
            insert: PreparedTokenSlice.fromTokens([
              closeToken('text'),
              openToken(
                'text',
                getProperties(getDefined(targetRun[targetIndex]))
              ),
            ]),
          });
        };

        addPropertyChanges(sourceRun[0], targetRun[0], [...parentPath, prefix]);
        for (let index = 1; index < sourceRun.length; index++) {
          const at = getDefined(sourceStarts[index]);

          for (
            ;
            next < targetCount && getDefined(targetStarts[next]) < at;
            next += 1
          ) {
            splitAt(next);
          }
          if (next < targetCount && targetStarts[next] === at) {
            addPropertyChanges(
              getDefined(sourceRun[index]),
              getDefined(targetRun[next]),
              [...parentPath, prefix + index]
            );
            next += 1;
          } else {
            const boundary = before.childPosition(parentPath, prefix + index);

            changes.push({ from: boundary - 1, to: boundary + 1 });
          }
        }
        for (; next < targetCount; next += 1) splitAt(next);

        flatDiffRekeys = true;
        return true;
      }
    }

    if (sourceCount * targetCount > TREE_DIFF_MATRIX_LIMIT) return false;

    const scores = Array.from({ length: sourceCount }, (_value, sourceIndex) =>
      Array.from({ length: targetCount }, (_targetValue, targetIndex) =>
        continuityScore(
          source[prefix + sourceIndex],
          target[prefix + targetIndex]
        )
      )
    );
    const matrix = Array.from(
      { length: sourceCount + 1 },
      () => new Float64Array(targetCount + 1)
    );

    for (let sourceIndex = sourceCount - 1; sourceIndex >= 0; sourceIndex--) {
      for (let targetIndex = targetCount - 1; targetIndex >= 0; targetIndex--) {
        const score = scores[sourceIndex][targetIndex];
        const matched =
          score > 0
            ? score + matrix[sourceIndex + 1][targetIndex + 1]
            : Number.NEGATIVE_INFINITY;

        matrix[sourceIndex][targetIndex] = Math.max(
          matched,
          matrix[sourceIndex + 1][targetIndex],
          matrix[sourceIndex][targetIndex + 1]
        );
      }
    }

    const matches: Array<readonly [number, number]> = [];
    let sourceIndex = 0;
    let targetIndex = 0;

    while (sourceIndex < sourceCount && targetIndex < targetCount) {
      const score = scores[sourceIndex][targetIndex];
      const matched =
        score > 0
          ? score + matrix[sourceIndex + 1][targetIndex + 1]
          : Number.NEGATIVE_INFINITY;
      const skipSource = matrix[sourceIndex + 1][targetIndex];
      const skipTarget = matrix[sourceIndex][targetIndex + 1];

      if (matched >= skipSource && matched >= skipTarget) {
        matches.push(
          Object.freeze([prefix + sourceIndex, prefix + targetIndex] as const)
        );
        sourceIndex += 1;
        targetIndex += 1;
      } else if (skipTarget >= skipSource) {
        targetIndex += 1;
      } else {
        sourceIndex += 1;
      }
    }

    let sourceCursor = prefix;
    let targetCursor = prefix;
    const addGap = (sourceTo: number, targetTo: number) => {
      if (sourceCursor === sourceTo && targetCursor === targetTo) return;

      changes.push({
        from: before.childPosition(parentPath, sourceCursor),
        insert: PreparedTokenSlice.fromNodes(
          target.slice(targetCursor, targetTo)
        ),
        to: before.childPosition(parentPath, sourceTo),
      });
    };

    for (const [matchedSource, matchedTarget] of matches) {
      addGap(matchedSource, matchedTarget);

      const row = scores[matchedSource - prefix];
      const score = row[matchedTarget - prefix];
      const best = Math.max(...row);
      const column = scores.map(
        (candidateRow) => candidateRow[matchedTarget - prefix]
      );
      const columnBest = Math.max(...column);

      if (
        matchedSource !== matchedTarget &&
        isCompleteTextContinuation(
          source[matchedSource],
          target[matchedTarget]
        ) &&
        score === best &&
        row.filter((candidate) => candidate === best).length === 1 &&
        score === columnBest &&
        column.filter((candidate) => candidate === columnBest).length === 1
      ) {
        flatDiffRekeys = true;
      }

      if (
        !diffNode(source[matchedSource], target[matchedTarget], [
          ...parentPath,
          matchedSource,
        ])
      ) {
        return false;
      }

      sourceCursor = matchedSource + 1;
      targetCursor = matchedTarget + 1;
    }

    addGap(sourceEnd, targetEnd);

    return true;
  };

  return diffChildren(before.value, after.value, []) && flatDiffRekeys
    ? changes
    : null;
};

const changedRangesAreSeparated = (a: RootChange, b: RootChange) => {
  const bRanges: Array<readonly [number, number]> = [];
  let separated = true;
  let bIndex = 0;

  b.iterChangedRanges((from, to) => {
    bRanges.push([from, to]);
  });
  a.iterChangedRanges((from, to) => {
    while (bIndex < bRanges.length && bRanges[bIndex][1] < from) bIndex += 1;
    if (bIndex < bRanges.length && bRanges[bIndex][0] <= to) separated = false;
  });

  return separated;
};

const sameNodeStructure = (left: JsonNode, right: JsonNode): boolean => {
  if (left === right) return true;
  if (isTextNode(left) || isTextNode(right)) {
    return isTextNode(left) && isTextNode(right);
  }
  if (
    !isElementNode(left) ||
    !isElementNode(right) ||
    left.type !== right.type ||
    left.children.length !== right.children.length
  ) {
    return false;
  }

  return left.children.every((child, index) =>
    sameNodeStructure(child, right.children[index])
  );
};

/**
 * Whether a range takes out no letter and no whole node, only edges that
 * open or close an element it leaves in place.
 */
const takesOutEdgesOnly = (
  document: DocumentIndex,
  { from, to }: Replacement
) => {
  let depth = 0;

  for (const token of document.slice(from, to).tokens) {
    if (token.kind === 'text') return false;
    depth += token.kind === 'open' ? 1 : -1;
  }

  return from === to || depth !== 0;
};

/**
 * One key per position of `[from, to)` that `removed` leaves, so two token
 * runs compare however their text is cut.
 */
const positionKeys = (
  document: DocumentIndex,
  removed: readonly Replacement[],
  from: number,
  to: number
) => {
  const keys: string[] = [];
  let position = from;

  for (const range of [...removed, { from: to, to }]) {
    let at = position;

    for (const token of document.slice(position, range.from).tokens) {
      if (token.kind === 'text') {
        // Positions count UTF-16 units, so the keys do too.
        for (let unit = 0; unit < token.text.length; unit += 1) {
          keys.push(token.text.charAt(unit));
        }
        at += token.text.length;
        continue;
      }

      const edge =
        token.kind === 'open'
          ? `<${token.nodeKind}${JSON.stringify(token.props)}`
          : `</${token.nodeKind}`;

      const identity = token.nodeKind === 'element' ? `@${at}` : '';

      keys.push(`${edge}${identity}`);
      at += 1;
    }
    position = range.to;
  }

  return keys;
};

/**
 * When `removal` only takes element and text edges out, and `other` takes
 * out edges that leave the very same tokens before putting edges of its own
 * in, as a step does that re-takes a teammate's equal wrap the teammate then
 * unwraps, `other` over `removal` is its own edges alone, each placed where
 * its removals left it.
 */
const putBackOver = (
  removal: readonly Replacement[],
  other: readonly Replacement[],
  document: DocumentIndex
) => {
  const removed = other.filter(({ from, to }) => from < to);

  if (
    removal.length === 0 ||
    removed.length === 0 ||
    !removal.every(({ insert }) => insert.length === 0) ||
    ![...removal, ...other].every((range) => takesOutEdgesOnly(document, range))
  ) {
    return null;
  }

  // Both leave every token outside the span their removals cover.
  const spanFrom = Math.min(
    ...[...removal, ...removed].map((range) => range.from)
  );
  const spanTo = Math.max(...[...removal, ...removed].map((range) => range.to));
  const left = positionKeys(document, removal, spanFrom, spanTo);
  const right = positionKeys(document, removed, spanFrom, spanTo);

  if (
    left.length !== right.length ||
    left.some((key, index) => key !== right[index])
  ) {
    return null;
  }

  let shift = 0;

  return other.flatMap(({ from, insert, to }) => {
    const at = from - shift;

    shift += to - from;

    return insert.length === 0 ? [] : [{ from: at, insert, to: at }];
  });
};

/** Whether a positional transform gives one document from both sides. */
const convergesOn = (
  transformed: Readonly<{ a: RootChange; b: RootChange }>,
  afterA: DocumentIndex,
  afterB: DocumentIndex
) => {
  try {
    return jsonEqual(
      transformed.b.apply(afterA).value,
      transformed.a.apply(afterB).value
    );
  } catch {
    return false;
  }
};

const depthChange = (token: JsonToken) =>
  token.kind === 'open' ? 1 : token.kind === 'close' ? -1 : 0;

const writtenBackCloses = (
  removed: readonly JsonToken[],
  insert: readonly JsonToken[]
) => {
  let closes = 0;

  while (
    closes < removed.length &&
    removed[removed.length - 1 - closes].kind === 'close'
  ) {
    closes += 1;
  }
  if (closes === 0) return null;

  let target = -closes;

  for (let index = 0; index < removed.length - closes; index += 1) {
    target += depthChange(removed[index]);
  }

  let depth = 0;
  let insertEnd = 0;

  while (insertEnd < insert.length && (insertEnd === 0 || depth !== target)) {
    depth += depthChange(insert[insertEnd]);
    insertEnd += 1;
  }
  if (depth !== target) return null;

  let keptCloses = 0;

  while (
    keptCloses < closes &&
    keptCloses < insertEnd &&
    tokensEqual(
      insert[insertEnd - 1 - keptCloses],
      removed[removed.length - 1 - keptCloses]
    )
  ) {
    keptCloses += 1;
  }

  return keptCloses === 0 ? null : { insertEnd, keptCloses };
};

const soleWrapProps = (
  replacements: readonly Replacement[],
  document: DocumentIndex
) => {
  if (replacements.length !== 2) return null;

  const [open, close] = replacements;
  const [lead] = open.insert.tokens;
  const [end] = close.insert.tokens;

  if (
    open.from !== open.to ||
    close.from !== close.to ||
    open.from >= close.from ||
    open.insert.tokens.length !== 1 ||
    close.insert.tokens.length !== 1 ||
    lead.kind !== 'open' ||
    lead.nodeKind !== 'element' ||
    end.kind !== 'close' ||
    end.nodeKind !== 'element'
  ) {
    return null;
  }

  const { tokens } = document.slice(open.from, close.from);
  let depth = 0;

  for (const token of tokens) {
    depth += depthChange(token);
    if (depth < 0) return null;
  }
  if (depth !== 0) return null;

  return lead.props;
};

const wrapsInsideReplacement = (
  wrap: readonly Replacement[],
  other: readonly Replacement[],
  document: DocumentIndex
) =>
  wrap.length > 1 &&
  wrap.every(
    ({ from, insert, to }) =>
      from === to &&
      insert.tokens.length === 1 &&
      insert.tokens[0].kind !== 'text' &&
      insert.tokens[0].nodeKind === 'element'
  ) &&
  other.some((range) =>
    wrap.every(({ from }) => range.from < from && from < range.to)
  ) &&
  !other.some(({ insert }) =>
    JSON.stringify(insert.toJSON()).includes(
      JSON.stringify(
        document
          .slice(getDefined(wrap[0]).from, getDefined(wrap.at(-1)).from)
          .toJSON()
      ).slice(1, -1)
    )
  );

const propertyWritesOf = (change: RootChange) => {
  const sections: number[] = [];
  const data: SectionData[] = [];

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];

    if (change.sections[index + 1] === -2) {
      addSection(sections, data, length, -2, change.data[index >> 1] ?? null);
    } else {
      addSection(sections, data, length, -1, null);
    }
  }

  return RootChange.fromSections(sections, data);
};

const piecesOf = (slice: PreparedTokenSlice) => {
  const pieces: string[] = [];
  let piece: unknown[] = [];
  let depth = 0;

  for (const token of slice.toJSON()) {
    const step = depthChange(token);

    piece.push(token);
    depth += step;
    if (depth <= 0) {
      pieces.push(JSON.stringify(piece));
      piece = [];
      depth = 0;
    }
  }
  if (piece.length > 0) {
    pieces.push(...piece.map((token) => JSON.stringify([token])));
  }

  return pieces;
};

type Range = Readonly<{ from: number; to: number }>;

type InsertedElement = Readonly<{
  close: Range;
  open: Range;
  props: Readonly<JsonRecord>;
}>;

export const insertedElementsOf = (
  change: RootChange,
  document: DocumentIndex
) => {
  const elements: InsertedElement[] = [];
  const open: Array<{ props: Readonly<JsonRecord>; run: Range } | null> = [];
  let position = 0;

  for (let index = 0; index < change.sections.length;) {
    if (change.sections[index + 1] < 0) {
      const length = change.sections[index];
      const { closes, opens } = crossed(document, position, position + length);

      open.length = Math.max(0, open.length - closes);
      for (const _ of opens) open.push(null);
      position += length;
      index += 2;
      continue;
    }

    const from = position;
    const tokens: JsonToken[] = [];

    while (index < change.sections.length && change.sections[index + 1] >= 0) {
      position += change.sections[index];
      tokens.push(
        ...((change.data[index >> 1] as PreparedTokenSlice | null)?.tokens ??
          [])
      );
      index += 2;
    }

    const run = { from, to: position };

    for (const token of tokens) {
      if (token.kind === 'open') {
        open.push(
          token.nodeKind === 'element' ? { props: token.props, run } : null
        );
      } else if (token.kind === 'close') {
        const element = open.pop();

        if (element) {
          elements.push({
            close: run,
            open: element.run,
            props: element.props,
          });
        }
      }
    }
  }

  return elements;
};

const touches = ({ from, to }: Range, at: number) => from <= at && at <= to;

const insertsWithin = (
  inner: RootChange,
  outer: RootChange,
  innerReplacements: readonly Replacement[],
  outerReplacements: readonly Replacement[],
  document: DocumentIndex
) => {
  if (
    innerReplacements.length === 0 ||
    innerReplacements.some(
      ({ from, insert, to }) => from !== to || insert.length === 0
    )
  ) {
    return false;
  }

  const nodesHeld = innerReplacements.every(({ from, insert }) => {
    const around = outerReplacements
      .filter((replacement) => touches(replacement, from))
      .map((replacement) => JSON.stringify(replacement.insert.toJSON()))
      .join('');

    return piecesOf(insert).every((piece) => {
      const [token, ...rest] = JSON.parse(piece) as JsonToken[];

      return rest.length === 0
        ? token.kind !== 'text' && token.nodeKind === 'element'
        : around.includes(piece.slice(1, -1));
    });
  });

  if (!nodesHeld) return false;

  const written = insertedElementsOf(outer, document);

  return insertedElementsOf(inner, document)
    .filter(({ close, open }) => open.from !== close.from)
    .every((element) =>
      written.some(
        (other) =>
          jsonEqual(other.props, element.props) &&
          touches(other.open, element.open.from) &&
          touches(other.close, element.close.from)
      )
    );
};

const addsElementOrRetypesTo = (step: RootChange, type: unknown) => {
  for (let index = 0; index < step.sections.length; index += 2) {
    const inserted = step.sections[index + 1];
    const data = step.data[index >> 1];

    if (
      inserted === -2
        ? (data as readonly PropertyModification[]).some(
            (modification) =>
              modification.key === 'type' &&
              modification.type === 'set' &&
              modification.value === type
          )
        : inserted > 0 &&
          (data as PreparedTokenSlice).tokens.some(
            (token) => token.kind === 'open' && token.nodeKind === 'element'
          )
    ) {
      return true;
    }
  }

  return false;
};

/** Whether `other` inserts strictly between the edges of a wrap in `wrap`. */
const addsInsideEnclosure = (
  wrap: readonly Replacement[],
  other: readonly Replacement[]
) => {
  const leads = wrap.filter(({ insert }) => opensEnclosure(insert));

  if (leads.length === 0) return false;

  const from = Math.min(...leads.map((lead) => lead.from));
  const to = Math.max(...wrap.map((edge) => edge.from));

  return other.some((edit) => from < edit.from && edit.from < to);
};

const onlyAddsStructure = (replacements: readonly Replacement[]) =>
  replacements.every(
    ({ from, insert, to }) =>
      from === to && insert.tokens.every((token) => token.kind !== 'text')
  );

const sameDocumentStructure = (
  left: readonly JsonNode[],
  right: readonly JsonNode[]
): boolean =>
  left.length === right.length &&
  left.every((node, index) => sameNodeStructure(node, right[index]));

const mergeStructuralRunByPosition = (
  structural: RootChange,
  concurrent: RootChange,
  concurrentReplacements: readonly Replacement[],
  before: DocumentIndex,
  afterStructural: DocumentIndex,
  afterConcurrent: DocumentIndex
): { merged: DocumentIndex; other: RootChange; rebased: RootChange } | null => {
  if (deletesBlocksAndInserts(before, concurrentReplacements)) return null;

  let rebased: RootChange | null = null;
  let twin = false;
  const structuralRanges: Array<readonly [number, number]> = [];
  const concurrentRanges: Array<readonly [number, number, number, number]> = [];

  structural.iterChangedRanges((from, to) => structuralRanges.push([from, to]));
  concurrent.iterChangedRanges((from, to, fromB, toB) =>
    concurrentRanges.push([from, to, fromB, toB])
  );

  const childrenAt = (document: DocumentIndex, path: readonly number[]) => {
    if (path.length === 0) return document.value;

    const node = document.node(path);

    return isElementNode(node) ? node.children : [];
  };
  const childStartingAt = (path: readonly number[], position: number) =>
    childrenAt(afterConcurrent, path).findIndex(
      (_, index) =>
        afterConcurrent.nodeRange([...path, index]).from === position
    );
  const descendantStartingAt = (
    path: readonly number[],
    position: number
  ): number[] | null => {
    const nodes = childrenAt(afterConcurrent, path);

    for (let index = 0; index < nodes.length; index++) {
      const { from, to } = afterConcurrent.nodeRange([...path, index]);

      if (from === position) return [index];
      if (from < position && position < to) {
        const rest = descendantStartingAt([...path, index], position);

        return rest && [index, ...rest];
      }
    }

    return null;
  };
  const withNodeAt = (
    nodes: readonly JsonNode[],
    [index, ...rest]: readonly number[],
    node: JsonNode
  ): JsonNode[] => {
    const at = getDefined(index);
    const current = nodes[at];

    return nodes.with(
      at,
      rest.length === 0 || !isElementNode(current)
        ? node
        : { ...current, children: withNodeAt(current.children, rest, node) }
    );
  };

  const mergeAt = (
    path: readonly number[],
    concurrentPath: readonly number[]
  ): JsonNode[] | null => {
    const beforeNodes = childrenAt(before, path);
    const structuralNodes = childrenAt(afterStructural, path);
    const concurrentNodes = childrenAt(afterConcurrent, concurrentPath);
    const shorter = Math.min(beforeNodes.length, structuralNodes.length);
    const prefixOf = (limit: number) => {
      let length = 0;

      while (
        length < limit &&
        jsonEqual(beforeNodes[length], structuralNodes[length])
      ) {
        length += 1;
      }

      return length;
    };
    const suffixOf = (limit: number) => {
      let length = 0;

      while (
        length < limit &&
        jsonEqual(beforeNodes.at(-1 - length), structuralNodes.at(-1 - length))
      ) {
        length += 1;
      }

      return length;
    };
    const from = prefixOf(shorter);
    const suffix = suffixOf(shorter - from);
    const lowest = prefixOf(shorter - suffixOf(shorter));
    const source = beforeNodes.slice(from, beforeNodes.length - suffix);
    const replacement = structuralNodes.slice(
      from,
      structuralNodes.length - suffix
    );

    if (source.length === 0 || sameDocumentStructure(source, replacement)) {
      return null;
    }

    const [element] = source;
    const range = before.nodeRange([...path, from]);
    const rewritesOnlyOpenToken = (
      changeFrom: number,
      changeTo: number,
      fromB: number,
      toB: number
    ) =>
      changeFrom === range.from &&
      changeTo === range.from + 1 &&
      toB - fromB === 1;

    if (
      source.length === 1 &&
      replacement.length === 1 &&
      isElementNode(element) &&
      structuralRanges.every(
        ([changeFrom, changeTo]) =>
          range.from < changeFrom && changeTo < range.to
      ) &&
      concurrentRanges.every(
        ([changeFrom, changeTo, fromB, toB]) =>
          changeTo <= range.from ||
          range.to <= changeFrom ||
          (range.from < changeFrom && changeTo < range.to) ||
          rewritesOnlyOpenToken(changeFrom, changeTo, fromB, toB)
      )
    ) {
      const opened = concurrent.mapPos(range.from + 1, -1);
      const at =
        opened === null
          ? null
          : descendantStartingAt(concurrentPath, opened - 1);
      const kept = at && afterConcurrent.node([...concurrentPath, ...at]);

      if (kept && isElementNode(kept) && kept.type === element.type) {
        const children = mergeAt([...path, from], [...concurrentPath, ...at]);

        if (children) {
          return withNodeAt(concurrentNodes, at, { ...kept, children });
        }
      }
    }

    const runRange = (at: number) => ({
      from: before.nodeRange([...path, at]).from,
      to: before.nodeRange([...path, at + source.length - 1]).to,
    });
    const shift = source.length - replacement.length;
    const tailMatches: boolean[] = [];

    tailMatches[structuralNodes.length] = true;
    for (let at = structuralNodes.length - 1; at >= lowest; at--) {
      tailMatches[at] =
        tailMatches[at + 1] &&
        jsonEqual(beforeNodes[at + shift], structuralNodes[at]);
    }

    const candidates: number[] = [];

    for (let at = lowest; at <= from; at++) {
      if (tailMatches[at + replacement.length]) candidates.push(at);
    }

    const rewrittenOpen = candidates.filter((at) =>
      structuralRanges.some(
        ([changeFrom, changeTo]) =>
          changeFrom <= runRange(at).from && runRange(at).from < changeTo
      )
    );
    const touched = candidates.filter((at) =>
      structuralRanges.some(
        ([changeFrom, changeTo]) =>
          changeFrom < runRange(at).to && runRange(at).from < changeTo
      )
    );
    const ownStarts =
      candidates.length === 1
        ? candidates
        : rewrittenOpen.length
          ? rewrittenOpen
          : touched;

    if (ownStarts.length !== 1) return null;

    const [start] = ownStarts as [number];
    const { from: runFrom, to: runTo } = runRange(start);
    const untouchedCopyAt = () => {
      const position = concurrent.mapPos(runFrom, 1);
      const untouched = concurrentRanges.every(
        ([changeFrom, changeTo]) => changeTo <= runFrom || runTo <= changeFrom
      );

      return position !== null && untouched
        ? childStartingAt(concurrentPath, position)
        : -1;
    };
    const match = untouchedCopyAt();

    if (match === -1) return null;

    const placed = structuralNodes.slice(start, start + replacement.length);
    const merged = [...concurrentNodes];

    merged.splice(match, source.length, ...placed);

    const copyFrom = afterConcurrent.nodeRange([...concurrentPath, match]).from;

    twin = candidates.length > 1;
    rebased =
      structural
        .within(runFrom, runTo)
        ?.embed(afterConcurrent.length, copyFrom) ??
      (twin
        ? RootChange.between(
            DocumentIndex.fromValue(
              concurrentNodes.slice(match, match + source.length)
            ),
            DocumentIndex.fromValue(placed)
          ).embed(afterConcurrent.length, copyFrom)
        : null);

    return merged;
  };

  const merged = mergeAt([], []);

  if (!merged) return null;

  const document = DocumentIndex.fromValue(merged);
  const lands = (change: RootChange, from: DocumentIndex) => {
    try {
      return jsonEqual(change.apply(from).value, merged);
    } catch {
      return false;
    }
  };

  const removedLength = (change: RootChange) => {
    let length = 0;

    change.iterChangedRanges((from, to) => {
      length += to - from;
    });

    return length;
  };
  const [rebasedChange] = [
    rebased,
    twin ? null : RootChange.between(afterConcurrent, document),
  ]
    .filter(
      (change): change is RootChange =>
        change !== null && lands(change, afterConcurrent)
    )
    .sort((left, right) => removedLength(left) - removedLength(right));

  if (!rebasedChange) return null;

  const concurrentPastStructural = [
    RootChange.transform(concurrent, structural).a,
    RootChange.transform(structural, concurrent).b,
  ].find((change) => lands(change, afterStructural));
  const other =
    concurrentPastStructural ?? RootChange.between(afterStructural, document);

  return { merged: document, other, rebased: rebasedChange };
};

const mergeStructuralChangeAtStableSiblingRange = (
  before: DocumentIndex,
  afterStructural: DocumentIndex,
  afterConcurrent: DocumentIndex
): { merged: DocumentIndex; other: RootChange; rebased: RootChange } | null => {
  let from = 0;

  while (
    from < before.value.length &&
    from < afterStructural.value.length &&
    jsonEqual(before.value[from], afterStructural.value[from])
  ) {
    from += 1;
  }

  let suffix = 0;

  while (
    suffix < before.value.length - from &&
    suffix < afterStructural.value.length - from &&
    jsonEqual(
      before.value.at(-1 - suffix),
      afterStructural.value.at(-1 - suffix)
    )
  ) {
    suffix += 1;
  }

  const source = before.value.slice(from, before.value.length - suffix);
  const replacement = afterStructural.value.slice(
    from,
    afterStructural.value.length - suffix
  );

  if (source.length === 0 || sameDocumentStructure(source, replacement)) {
    return null;
  }

  let match = -1;

  for (
    let index = 0;
    index <= afterConcurrent.value.length - source.length;
    index++
  ) {
    if (
      source.every((node, offset) =>
        jsonEqual(node, afterConcurrent.value[index + offset])
      )
    ) {
      if (match !== -1) return null;

      match = index;
    }
  }

  if (match === -1) return null;

  const merged = [...afterConcurrent.value];

  merged.splice(match, source.length, ...replacement);

  const document = DocumentIndex.fromValue(merged);

  return {
    merged: document,
    other: RootChange.between(afterStructural, document),
    rebased: RootChange.between(afterConcurrent, document),
  };
};

const collectDocumentNodes = (
  nodes: readonly JsonNode[],
  parentPath: readonly number[] = [],
  result: Array<Readonly<{ node: JsonNode; path: readonly number[] }>> = []
) => {
  nodes.forEach((node, index) => {
    const path = [...parentPath, index];

    result.push({ node, path });
    if (isElementNode(node)) collectDocumentNodes(node.children, path, result);
  });

  return result;
};

const mergeNestedChangeThroughStructuralRelocation = (
  nested: RootChange,
  structural: RootChange,
  before: DocumentIndex,
  afterNested: DocumentIndex,
  afterStructural: DocumentIndex
): DocumentIndex | null => {
  if (
    sameDocumentStructure(before.value, afterStructural.value) ||
    nested.empty
  ) {
    return null;
  }

  const changedRanges: Array<readonly [number, number]> = [];

  nested.iterChangedRanges((from, to) => changedRanges.push([from, to]));
  if (changedRanges.length === 0) return null;

  const structuralRanges: Array<readonly [number, number]> = [];

  structural.iterChangedRanges((from, to) => structuralRanges.push([from, to]));

  const afterNodes = collectDocumentNodes(afterStructural.value);
  const candidates = collectDocumentNodes(before.value)
    .filter(({ path }) => {
      const range = before.nodeRange(path);

      // A node the change removes whole has no image, and its old path
      // names a sibling.
      return (
        changedRanges.every(
          ([from, to]) => range.from <= from && to <= range.to
        ) && nested.mapPos(range.from, -1) !== nested.mapPos(range.to, 1)
      );
    })
    .sort((left, right) => right.path.length - left.path.length);

  let partial: DocumentIndex | null = null;

  for (const candidate of candidates) {
    const range = before.nodeRange(candidate.path);

    if (
      structuralRanges.every(
        ([from, to]) => to <= range.from || range.to <= from
      )
    ) {
      continue;
    }

    const targets = afterNodes.filter(({ node }) =>
      jsonEqual(node, candidate.node)
    );

    if (targets.length !== 1) continue;

    const end = range.to + nested.newLength - nested.length;
    const parentPath = candidate.path.slice(0, -1);
    const edited: JsonNode[] = [];
    let at = range.from;
    let index = candidate.path.at(-1) ?? 0;
    let siblings: readonly JsonNode[] = [];

    try {
      const parent =
        parentPath.length === 0 ? null : afterNested.node(parentPath);

      siblings =
        parent === null
          ? afterNested.value
          : isElementNode(parent)
            ? parent.children
            : [];

      for (; at < end && index < siblings.length; index++) {
        const siblingRange = afterNested.nodeRange([...parentPath, index]);

        if (siblingRange.from !== at) break;
        edited.push(siblings[index]);
        at = siblingRange.to;
      }
    } catch {
      continue;
    }
    if (edited.length === 0 || (at !== end && index < siblings.length)) {
      continue;
    }
    if (edited.some((node) => jsonEqual(node, candidate.node))) continue;

    const targetPath = targets[0].path;
    const targetIndex = targetPath.at(-1);

    if (targetIndex === undefined) continue;

    const merged = afterStructural.withSplicedNodes(
      targetPath.slice(0, -1),
      targetIndex,
      1,
      edited
    );

    if (at === end) return merged;
    partial ??= merged;
  }

  return partial;
};

const deletesWholeSiblings = (
  document: DocumentIndex,
  replacement: Replacement | undefined
): replacement is Replacement => {
  if (!replacement || replacement.insert.length > 0) return false;

  const first = document.nodeStartingAt(replacement.from);
  const end = document.childBoundaryAt(replacement.to);

  if (!first || !end) return false;

  const index = getDefined(first.path.at(-1));

  return (
    end.index > index &&
    pathKey(first.path.slice(0, -1)) === pathKey(end.parentPath)
  );
};

const deletesBlocksAndInserts = (
  document: DocumentIndex,
  replacements: readonly Replacement[]
) =>
  replacements.some((replacement) =>
    deletesWholeSiblings(document, replacement)
  ) && replacements.some(({ insert }) => insert.length > 0);

type WrapFrame = {
  holdsKept: boolean;
  holdsRemoved: boolean;
  /** Where the edit inserts the open, as section and token index, or null. */
  open: readonly [number, number] | null;
};

/**
 * When `edit` only inserts inside the whole siblings `deletion` removes,
 * finds each element `edit` inserts whose content is only removed tokens or
 * such elements. Returns `edit` without those elements and the change that
 * takes them out of `edit`'s output, or null when there are none or an
 * insert does not nest whole between the deleted tokens. It reads which
 * tokens are original, never their letters.
 */
const wrapsInsideDeletion = (
  document: DocumentIndex,
  deletion: Replacement,
  edit: RootChange
): Readonly<{ stripped: RootChange; unwrap: RootChange }> | null => {
  const inserts: Array<
    Readonly<{ at: number; section: number; tokens: readonly JsonToken[] }>
  > = [];
  let position = 0;

  for (let index = 0; index < edit.sections.length; index += 2) {
    const length = edit.sections[index];
    const from = position;

    position += length;
    if (edit.sections[index + 1] < 0) continue;
    if (length > 0) {
      if (from < deletion.to && position > deletion.from) return null;
      continue;
    }
    if (deletion.from <= from && from <= deletion.to) {
      inserts.push({
        at: from,
        section: index,
        tokens: (edit.data[index >> 1] as PreparedTokenSlice).tokens,
      });
    }
  }
  if (inserts.length === 0) return null;

  const absorbed = new Map<number, Set<number>>();
  const stack: WrapFrame[] = [
    { holdsKept: false, holdsRemoved: false, open: null },
  ];
  const visit = (
    token: JsonToken,
    origin: readonly [number, number] | null
  ) => {
    const top = getDefined(stack.at(-1));

    if (token.kind === 'text') {
      if (origin) top.holdsKept = true;
      else top.holdsRemoved = true;
      return true;
    }
    if (token.kind === 'open') {
      stack.push({ holdsKept: false, holdsRemoved: false, open: origin });
      return true;
    }
    if (stack.length === 1) return false;

    const frame = getDefined(stack.pop());
    const parent = getDefined(stack.at(-1));

    if (!frame.open && !origin) {
      parent.holdsRemoved = true;
      parent.holdsKept ||= frame.holdsKept;
    } else if (
      frame.open &&
      origin &&
      token.nodeKind === 'element' &&
      frame.holdsRemoved &&
      !frame.holdsKept
    ) {
      for (const [section, index] of [frame.open, origin]) {
        const peeled = absorbed.get(section) ?? new Set<number>();

        peeled.add(index);
        absorbed.set(section, peeled);
      }
      parent.holdsRemoved = true;
    } else {
      parent.holdsKept = true;
    }
    return true;
  };
  let next = 0;
  const visitInsertsUpTo = (at: number) => {
    for (; next < inserts.length && inserts[next].at <= at; next += 1) {
      const { section, tokens } = inserts[next];

      // An insert before `at` that was not visited lands inside a text token.
      if (inserts[next].at < at) return false;
      for (let index = 0; index < tokens.length; index += 1) {
        if (!visit(tokens[index], [section, index])) return false;
      }
    }
    return true;
  };
  let at = deletion.from;

  for (const token of document.slice(deletion.from, deletion.to).tokens) {
    if (!visitInsertsUpTo(at) || !visit(token, null)) return null;
    at += tokenLength(token);
  }
  if (!visitInsertsUpTo(at) || stack.length !== 1 || absorbed.size === 0) {
    return null;
  }

  const sections: number[] = [];
  const data: SectionData[] = [];
  const unwrapSections: number[] = [];
  const unwrapData: SectionData[] = [];

  for (let index = 0; index < edit.sections.length; index += 2) {
    const length = edit.sections[index];
    const inserted = edit.sections[index + 1];
    const value = edit.data[index >> 1];
    const peeled = absorbed.get(index);

    if (!peeled) {
      addSection(sections, data, length, inserted, value);
      addSection(
        unwrapSections,
        unwrapData,
        inserted < 0 ? length : inserted,
        -1,
        null
      );
      continue;
    }

    const slice = value as PreparedTokenSlice;
    const { tokens } = slice;
    const keptTokens: JsonToken[] = [];
    const keptAt = new Map<number, number>();
    let start = 0;
    let peeledLength = 0;

    tokens.forEach((token, tokenIndex) => {
      if (peeled.has(tokenIndex)) {
        peeledLength += tokenLength(token);
      } else {
        keptTokens.push(token);
        keptAt.set(start, start - peeledLength);
      }
      start += tokenLength(token);
    });

    const nodeKeys = new Map<number, NodeKey>();

    for (const [keyAt, key] of getDocumentSliceNodeKeys(slice)) {
      const to = keptAt.get(keyAt);

      if (to !== undefined) nodeKeys.set(to, key);
    }

    const kept =
      PreparedTokenSlice.fromTokens(keptTokens).withNodeKeys(nodeKeys);

    addSection(sections, data, length, kept.length, kept);
    tokens.forEach((token, offset) => {
      if (peeled.has(offset)) {
        addSection(unwrapSections, unwrapData, 1, 0, PreparedTokenSlice.empty);
      } else {
        addSection(unwrapSections, unwrapData, tokenLength(token), -1, null);
      }
    });
  }

  return {
    stripped: RootChange.fromSections(sections, data),
    unwrap: RootChange.fromSections(unwrapSections, unwrapData),
  };
};

const keepsElementsWhole = (document: DocumentIndex, change: RootChange) => {
  let from = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    if (inserted >= 0) {
      const to = from + length;
      let depth = 0;

      if (
        length > 0 &&
        document
          .nodeRangesTouching(from, to)
          .some(
            (range) =>
              range.kind === 'element' &&
              (range.contentFrom > from || range.contentTo < to)
          )
      ) {
        return false;
      }
      for (const token of (change.data[index >> 1] as PreparedTokenSlice)
        .tokens) {
        if (token.kind === 'text' || token.nodeKind === 'text') continue;
        depth += token.kind === 'open' ? 1 : -1;

        if (depth < 0) return false;
      }
      if (depth !== 0) return false;
    }
    from += length;
  }

  return true;
};

const transformMixedEditOverSiblingRemoval = (
  a: RootChange,
  b: RootChange,
  aReplacements: readonly Replacement[],
  bReplacements: readonly Replacement[],
  document: DocumentIndex,
  afterA: DocumentIndex,
  afterB: DocumentIndex
): Readonly<{ a: RootChange; b: RootChange }> | null => {
  for (const [removal, edit, replacements, side] of [
    [b, a, bReplacements, 'b'],
    [a, b, aReplacements, 'a'],
  ] as const) {
    const [removed] = replacements;

    if (replacements.length !== 1 || !deletesWholeSiblings(document, removed)) {
      continue;
    }

    const parts = edit.partition(removed.from, removed.to - 1);
    const from = edit.mapPos(removed.from, 1);
    const to = edit.mapPos(removed.to, -1);

    if (
      !parts ||
      parts.inside.empty ||
      parts.outside.empty ||
      !keepsElementsWhole(document, parts.outside) ||
      from === null ||
      to === null
    ) {
      continue;
    }

    const [afterEdit, afterRemoval] =
      side === 'b' ? [afterA, afterB] : [afterB, afterA];
    const kept = RootChange.transform(parts.outside, removal).a;
    const merged = kept.apply(afterRemoval);
    const removalAfterEdit = RootChange.create(afterEdit, { from, to });
    const removedAfterEdit = removalAfterEdit.compose(
      RootChange.between(removalAfterEdit.apply(afterEdit), merged)
    );

    return side === 'b'
      ? { a: kept, b: removedAfterEdit }
      : { a: removedAfterEdit, b: kept };
  }

  return null;
};

/**
 * Transform a deletion of whole siblings by position alone against an edit
 * whose wrappers hold only what it deletes, and take those wrappers with it.
 * Null leaves the pair, wrappers included, to the value repairs.
 */
const transformByPositionOverAbsorbedWraps = (
  a: RootChange,
  b: RootChange,
  aReplacements: readonly Replacement[],
  bReplacements: readonly Replacement[],
  document: DocumentIndex,
  replayBase: DocumentIndex | undefined,
  readBack: ReadBack | null
): Readonly<{ a: RootChange; b: RootChange }> | null => {
  for (const side of ['a', 'b'] as const) {
    const [replacements, edit] =
      side === 'a' ? [aReplacements, b] : [bReplacements, a];
    const [deletion] = replacements;

    if (
      replacements.length !== 1 ||
      !deletesWholeSiblings(document, deletion)
    ) {
      continue;
    }

    const wraps = wrapsInsideDeletion(document, deletion, edit);

    if (!wraps) continue;

    const inner =
      side === 'a'
        ? RootChange.transform(a, wraps.stripped, replayBase, readBack)
        : RootChange.transform(wraps.stripped, b, replayBase, readBack);
    const [afterInnerA, afterInnerB] =
      side === 'a'
        ? [a.apply(document), wraps.stripped.apply(document)]
        : [wraps.stripped.apply(document), b.apply(document)];

    if (!convergesOn(inner, afterInnerA, afterInnerB)) continue;

    return side === 'a'
      ? { a: wraps.unwrap.compose(inner.a), b: inner.b }
      : { a: inner.a, b: wraps.unwrap.compose(inner.b) };
  }

  return null;
};

type SectionEnds = Readonly<{
  /** Where each section starts and ends in the input and in the output. */
  endA: Float64Array;
  endB: Float64Array;
  startA: Float64Array;
  startB: Float64Array;
}>;

const SECTION_ENDS = new WeakMap<RootChange, SectionEnds>();

/**
 * The sections from `before` to `after` that keep every letter and element
 * token, rewriting only the leaf tokens between them; null when the two hold
 * other letters or element tokens.
 */
const alignLetters = (
  before: PreparedTokenSlice,
  after: PreparedTokenSlice
): Readonly<{ data: SectionData[]; sections: number[] }> | null => {
  const left = before.tokens;
  const right = after.tokens;
  const sections: number[] = [];
  const data: SectionData[] = [];
  let leftToken = 0;
  let rightToken = 0;
  let leftLetter = 0;
  let rightLetter = 0;
  let rightPosition = 0;

  for (;;) {
    const leftGap = leftToken;
    const rightGap = rightToken;
    const gapFrom = rightPosition;

    while (leftToken < left.length && isLeafToken(left[leftToken])) {
      leftToken += 1;
    }
    while (rightToken < right.length && isLeafToken(right[rightToken])) {
      rightToken += 1;
      rightPosition += 1;
    }

    const leftLength = leftToken - leftGap;
    const rightLength = rightToken - rightGap;

    if (
      leftLength === rightLength &&
      left
        .slice(leftGap, leftToken)
        .every((token, at) => tokensEqual(token, right[rightGap + at]))
    ) {
      addSection(sections, data, leftLength, -1, null);
    } else {
      addSection(
        sections,
        data,
        leftLength,
        rightLength,
        after.slice(gapFrom, rightPosition)
      );
    }
    if (leftToken === left.length || rightToken === right.length) {
      return leftToken === left.length && rightToken === right.length
        ? { data, sections }
        : null;
    }

    const leftAnchor = left[leftToken];
    const rightAnchor = right[rightToken];

    if (leftAnchor.kind === 'text' && rightAnchor.kind === 'text') {
      const length = Math.min(
        leftAnchor.text.length - leftLetter,
        rightAnchor.text.length - rightLetter
      );

      if (
        leftAnchor.text.slice(leftLetter, leftLetter + length) !==
        rightAnchor.text.slice(rightLetter, rightLetter + length)
      ) {
        return null;
      }
      addSection(sections, data, length, -1, null);
      leftLetter += length;
      rightLetter += length;
      rightPosition += length;
      if (leftLetter === leftAnchor.text.length) {
        leftToken += 1;
        leftLetter = 0;
      }
      if (rightLetter === rightAnchor.text.length) {
        rightToken += 1;
        rightLetter = 0;
      }
    } else if (
      leftLetter === 0 &&
      rightLetter === 0 &&
      tokensEqual(leftAnchor, rightAnchor)
    ) {
      addSection(sections, data, 1, -1, null);
      leftToken += 1;
      rightToken += 1;
      rightPosition += 1;
    } else return null;
  }
};

/** An open or close of a text leaf, which holds no letter of its own. */
export const isLeafToken = (token: JsonToken) =>
  token.kind !== 'text' && token.nodeKind === 'text';

const sectionEndsOf = (change: RootChange): SectionEnds => {
  let ends = SECTION_ENDS.get(change);

  if (!ends) {
    const count = change.sections.length / 2;
    const startA = new Float64Array(count);
    const startB = new Float64Array(count);
    const endA = new Float64Array(count);
    const endB = new Float64Array(count);
    let a = 0;
    let b = 0;

    for (let section = 0; section < count; section++) {
      const length = change.sections[section * 2];
      const inserted = change.sections[section * 2 + 1];

      startA[section] = a;
      startB[section] = b;
      a += length;
      b += inserted < 0 ? length : inserted;
      endA[section] = a;
      endB[section] = b;
    }
    ends = { endA, endB, startA, startB };
    SECTION_ENDS.set(change, ends);
  }

  return ends;
};

/** The first section whose end, in `ends`, is past `position` (or at it). */
const firstSectionEnding = (
  ends: Float64Array,
  position: number,
  inclusive: boolean
) => {
  let low = 0;
  let high = ends.length;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (inclusive ? ends[middle] < position : ends[middle] <= position) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low;
};

/**
 * Whether a section that replaces content covers `position`, read in the
 * change's input (`before`) or output (`after`) coordinates.
 *
 * @internal
 */
export const isRootChangePositionReplaced = (
  change: RootChange,
  position: number,
  side: 'after' | 'before'
) => {
  const ends = sectionEndsOf(change);
  // Ranges are disjoint, so the first section ending past the position is the
  // only one that can hold it; an empty section holds nothing.
  const section = firstSectionEnding(
    side === 'before' ? ends.endA : ends.endB,
    position,
    false
  );

  if (section >= ends.endA.length) return false;

  const start = side === 'before' ? ends.startA[section] : ends.startB[section];

  return change.sections[section * 2 + 1] >= 0 && start <= position;
};

type ChangedRanges = Readonly<{ fromA: Float64Array; toA: Float64Array }>;

const CHANGED_RANGES = new WeakMap<RootChange, ChangedRanges>();

/**
 * Whether one of the change's changed ranges, as `iterChangedRanges` merges
 * them, covers `from` to `to` in its input.
 *
 * @internal
 */
export const isRootChangeRangeReplaced = (
  change: RootChange,
  from: number,
  to: number
) => {
  let ranges = CHANGED_RANGES.get(change);

  if (!ranges) {
    const starts: number[] = [];
    const ends: number[] = [];

    change.iterChangedRanges((fromA, toA) => {
      starts.push(fromA);
      ends.push(toA);
    });
    ranges = {
      fromA: Float64Array.from(starts),
      toA: Float64Array.from(ends),
    };
    CHANGED_RANGES.set(change, ranges);
  }

  // Ranges are sorted and disjoint, so the last one starting at or before
  // `from` reaches furthest.
  const after = firstSectionEnding(ranges.fromA, from, false);

  return after > 0 && ranges.toA[after - 1] >= to;
};

export type KeptRun = Readonly<{ at: number; from: number; to: number }>;

/**
 * The input token runs the change keeps for output tokens `from` to `to`, in
 * order: each run is the same tokens in the input, starting at `at`, so the
 * output tokens a replacement wrote have no run. Walks only the sections that
 * reach the range.
 *
 * @internal
 */
export const keptRunsOf = (
  change: RootChange,
  from: number,
  to: number
): readonly KeptRun[] => {
  const ends = sectionEndsOf(change);
  const runs: KeptRun[] = [];

  for (
    let section = firstSectionEnding(ends.endB, from, false);
    section < ends.endB.length && ends.startB[section] < to;
    section++
  ) {
    if (change.sections[section * 2 + 1] >= 0) continue;

    const start = Math.max(from, ends.startB[section]);
    const end = Math.min(to, ends.endB[section]);

    if (start < end) {
      runs.push({
        at: ends.startA[section] + start - ends.startB[section],
        from: start,
        to: end,
      });
    }
  }

  return runs;
};

const sortJoiningInsertions = (replacements: readonly Replacement[]) => {
  const sorted: Replacement[] = [];

  for (const replacement of [...replacements].sort(
    (left, right) => left.from - right.from
  )) {
    const previous = sorted.at(-1);

    if (
      previous &&
      previous.from === previous.to &&
      previous.to === replacement.from
    ) {
      sorted[sorted.length - 1] = {
        from: previous.from,
        insert: previous.insert.concat(replacement.insert),
        to: replacement.to,
      };
    } else {
      sorted.push(replacement);
    }
  }

  return sorted;
};

/**
 * Map an output position back to the input, as `change.invert(before).mapPos`
 * would, without copying the content the change replaced.
 *
 * @internal
 */
export const mapRootChangePositionBackward = (
  change: RootChange,
  position: number,
  assoc: -1 | 1 = -1,
  track?: TrackMode
): number | null => {
  const ends = sectionEndsOf(change);
  const first = firstSectionEnding(ends.endB, position, true);
  let positionB =
    first < ends.startB.length ? ends.startB[first] : change.newLength;
  let positionA =
    first < ends.startA.length ? ends.startA[first] : change.length;

  for (let index = first * 2; index < change.sections.length;) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    index += 2;
    if (inserted < 0) {
      const endB = positionB + length;

      if (endB > position) return positionA + position - positionB;
      positionA += length;
      positionB = endB;
      continue;
    }

    const endB = positionB + inserted;

    if (
      track &&
      endB >= position &&
      ((track === 'around' && positionB < position && endB > position) ||
        (track === 'before' && positionB < position) ||
        (track === 'after' && endB > position))
    ) {
      return null;
    }
    if (endB > position || (endB === position && assoc < 0 && inserted === 0)) {
      return position === positionB || assoc < 0
        ? positionA
        : positionA + length;
    }
    positionA += length;
    positionB = endB;
  }

  if (position > positionB) {
    throw new RangeError(
      `Position ${position} exceeds RootChange output length ${positionB}.`
    );
  }

  return positionA;
};

export class RootChange {
  readonly data: readonly SectionData[];
  readonly length: number;
  readonly newLength: number;
  readonly sections: readonly number[];

  private constructor(
    sections: readonly number[],
    data: readonly SectionData[]
  ) {
    this.sections = Object.freeze(sections);
    this.data = Object.freeze(data);
    this.length = this.sections.reduce(
      (length, value, index) => (index % 2 === 0 ? length + value : length),
      0
    );
    this.newLength = this.sections.reduce((length, value, index) => {
      if (index % 2 === 0) return length;

      return length + (value < 0 ? this.sections[index - 1] : value);
    }, 0);
    Object.freeze(this);
  }

  static create(
    document: DocumentIndex,
    changes: RootChangeSection | readonly RootChangeSection[]
  ) {
    const input = Array.isArray(changes) ? changes : [changes];
    const ordered = input
      .map((change, index) => ({ ...change, index }))
      .sort(
        (left, right) => left.from - right.from || left.index - right.index
      );
    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;

    for (const change of ordered) {
      const to =
        change.to ??
        (change.properties === undefined ? change.from : change.from + 1);

      if (
        !Number.isInteger(change.from) ||
        !Number.isInteger(to) ||
        change.from < position ||
        to < change.from ||
        to > document.length
      ) {
        throw new RangeError(
          `Invalid or overlapping change range ${change.from}-${to}.`
        );
      }
      if (change.insert && change.properties) {
        throw new Error(
          'A document change section cannot replace content and modify properties.'
        );
      }

      if (change.from > position) {
        addSection(sections, data, change.from - position, -1, null);
      }

      if (change.properties) {
        const entry = document.nodeStartingAt(change.from);

        if (!entry || to !== change.from + 1) {
          throw new Error(
            'Node property delta must target one open node token.'
          );
        }

        const modifications = normalizePropertyDelta(change.properties);

        addSection(
          sections,
          data,
          1,
          modifications.length > 0 ? -2 : -1,
          modifications.length > 0 ? modifications : null
        );
        position = to;
        continue;
      }

      const insert = change.insert ?? PreparedTokenSlice.empty;

      addSection(sections, data, to - change.from, insert.length, insert);
      position = to;
    }

    if (position < document.length) {
      addSection(sections, data, document.length - position, -1, null);
    }

    return new RootChange(sections, data);
  }

  static between(
    before: DocumentIndex,
    after: DocumentIndex,
    options: Readonly<{
      emptySetsAsValues?: boolean;
      isSetValued?: DocumentSetPropertyResolver;
      root?: string | null;
    }> = {}
  ) {
    if (jsonEqual(before.value, after.value)) {
      return RootChange.empty(before.length);
    }

    const beforeTokens = before.tokens;
    const afterTokens = after.tokens;
    const propertyOnly =
      beforeTokens.length === afterTokens.length &&
      beforeTokens.tokens.length === afterTokens.tokens.length &&
      beforeTokens.tokens.every((token, index) => {
        const next = afterTokens.tokens[index];

        if (!next || token.kind !== next.kind) return false;
        if (token.kind === 'text' && next.kind === 'text') {
          return token.text === next.text;
        }
        if (token.kind === 'open' && next.kind === 'open') {
          return token.nodeKind === next.nodeKind;
        }

        return (
          token.kind === 'close' &&
          next.kind === 'close' &&
          token.nodeKind === next.nodeKind
        );
      });

    if (propertyOnly) {
      const changes = beforeTokens.tokens.flatMap((token, index) => {
        const next = afterTokens.tokens[index];

        if (
          token.kind !== 'open' ||
          next.kind !== 'open' ||
          jsonEqual(token.props, next.props)
        ) {
          return [];
        }

        const entry = before.nodeStartingAt(beforeTokens.offsets[index]);

        if (!entry) {
          throw new Error('Cannot resolve changed node properties.');
        }

        const node = before.node(entry.path);
        const context = getDocumentPropertyContext(
          before,
          entry.path,
          options.root ?? null
        );
        const modifications = betweenPropertyModifications(
          token.props,
          next.props,
          (key) => options.isSetValued?.(node, key, context) ?? false,
          options.emptySetsAsValues
        );

        return modifications.length === 0
          ? []
          : [
              {
                from: beforeTokens.offsets[index],
                properties: propertyDeltaFromModifications(modifications),
                to: beforeTokens.offsets[index] + 1,
              } satisfies RootChangeSection,
            ];
      });

      return RootChange.create(before, changes);
    }

    const from = commonPrefixLength(beforeTokens.tokens, afterTokens.tokens);
    const suffix = commonSuffixLength(
      before.tokens.tokens,
      after.tokens.tokens,
      Math.min(before.length, after.length) - from
    );

    const flat = RootChange.create(before, {
      from,
      insert: after.slice(from, after.length - suffix),
      to: before.length - suffix,
    });
    const aligned = createStructurallyAlignedChanges(before, after, options);

    return aligned ? RootChange.create(before, aligned) : flat;
  }

  /**
   * The change from `before` to `after` that keeps every letter and element
   * token and rewrites only the text-leaf tokens around them, so a change of
   * marks or leaf splits keeps what each letter is; null when the two hold
   * other letters or element tokens, or the same in another order.
   */
  static aligned(before: DocumentIndex, after: DocumentIndex) {
    const ranges = before.changedChildren(after);
    const first = ranges[0];
    const last = ranges.at(-1);

    if (!first || !last) return RootChange.empty(before.length);

    const startOf = (document: DocumentIndex, child: number) =>
      child < document.size
        ? document.nodeRange([child]).from
        : document.length;
    const from = startOf(before, first[0]);
    const to = startOf(before, last[1]);
    const window = alignLetters(
      before.slice(from, to),
      after.slice(startOf(after, first[2]), startOf(after, last[3]))
    );

    if (!window) return null;

    const sections: number[] = [];
    const data: SectionData[] = [];

    addSection(sections, data, from, -1, null);
    for (let index = 0; index < window.sections.length; index += 2) {
      addSection(
        sections,
        data,
        window.sections[index],
        window.sections[index + 1],
        window.data[index >> 1]
      );
    }
    addSection(sections, data, before.length - to, -1, null);

    return new RootChange(sections, data);
  }

  static empty(length: number) {
    return length === 0
      ? new RootChange([], [])
      : new RootChange([length, -1], [null]);
  }

  /**
   * Lift this change from a token window into its parent document.
   *
   * @internal
   */
  embed(length: number, offset: number) {
    if (
      !Number.isSafeInteger(length) ||
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset + this.length > length
    ) {
      throw new RangeError('Cannot embed a change outside its document.');
    }

    const sections: number[] = [];
    const data: SectionData[] = [];

    addSection(sections, data, offset, -1, null);

    for (
      let index = 0, dataIndex = 0;
      index < this.sections.length;
      dataIndex++
    ) {
      const innerLength = this.sections[index];
      const inserted = this.sections[index + 1];

      index += 2;
      addSection(sections, data, innerLength, inserted, this.data[dataIndex]);
    }

    addSection(sections, data, length - offset - this.length, -1, null);

    return new RootChange(sections, data);
  }

  /**
   * Split this change into its edits inside `from..to` and its edits outside,
   * each over the same document. An insertion at `from` is outside and one at
   * `to` is inside. Null when an edit crosses either boundary.
   */
  partition(
    from: number,
    to: number
  ): { inside: RootChange; outside: RootChange } | null {
    const inside: number[] = [];
    const insideData: SectionData[] = [];
    const outside: number[] = [];
    const outsideData: SectionData[] = [];
    let at = 0;

    for (
      let index = 0, dataIndex = 0;
      index < this.sections.length;
      index += 2, dataIndex++
    ) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];
      const value = this.data[dataIndex];
      const end = at + length;

      if (inserted === -1) {
        addSection(inside, insideData, length, -1, null);
        addSection(outside, outsideData, length, -1, null);
      } else if (length > 0 ? at >= from && end <= to : at > from && at <= to) {
        addSection(inside, insideData, length, inserted, value);
        addSection(outside, outsideData, length, -1, null);
      } else if (end <= from || at >= to) {
        addSection(inside, insideData, length, -1, null);
        addSection(outside, outsideData, length, inserted, value);
      } else {
        return null;
      }
      at = end;
    }

    return {
      inside: new RootChange(inside, insideData),
      outside: new RootChange(outside, outsideData),
    };
  }

  /**
   * This change's part inside `from` to `to` of its document, as a change to
   * that window, the inverse of `embed`. Null when a section that changes
   * content does not lie inside the window; an insertion at either end lies
   * inside.
   *
   * @internal
   */
  within(from: number, to: number): RootChange | null {
    const sections: number[] = [];
    const data: SectionData[] = [];
    let at = 0;

    for (
      let index = 0, dataIndex = 0;
      index < this.sections.length;
      index += 2, dataIndex++
    ) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];
      const end = at + length;

      if (inserted === -1) {
        addSection(
          sections,
          data,
          Math.max(0, Math.min(end, to) - Math.max(at, from)),
          -1,
          null
        );
      } else if (at < from || end > to) {
        return null;
      } else {
        addSection(sections, data, length, inserted, this.data[dataIndex]);
      }
      at = end;
    }

    return new RootChange(sections, data);
  }

  static fromJSON(json: RootChangeJson) {
    assertEditorJsonValue(json, 'RootChange JSON');

    if (!Array.isArray(json)) throw new Error('Invalid RootChange JSON.');

    const sections: number[] = [];
    const data: SectionData[] = [];

    for (const section of json) {
      if (
        !isRecord(section) ||
        typeof section.length !== 'number' ||
        !Number.isSafeInteger(section.length) ||
        section.length < 0
      ) {
        throw new Error('Invalid RootChange JSON.');
      }

      if (
        section.replacement !== undefined &&
        section.properties !== undefined
      ) {
        throw new Error('Invalid RootChange JSON.');
      }

      if (section.properties !== undefined) {
        if (section.length !== 1) throw new Error('Invalid RootChange JSON.');

        const modifications = propertyModificationsFromJSON(section.properties);

        if (modifications.length === 0) {
          throw new Error('Invalid property delta JSON.');
        }

        addSection(sections, data, 1, -2, modifications);
      } else if (section.replacement === undefined) {
        addSection(sections, data, section.length, -1, null);
      } else {
        if (!Array.isArray(section.replacement)) {
          throw new Error('Invalid RootChange JSON.');
        }

        const replacement = PreparedTokenSlice.fromJSON(
          section.replacement as readonly JsonTokenData[]
        );

        addSection(
          sections,
          data,
          section.length,
          replacement.length,
          replacement
        );
      }
    }

    return new RootChange(sections, data);
  }

  static fromSections(
    sections: readonly number[],
    data: readonly SectionData[]
  ) {
    return new RootChange([...sections], [...data]);
  }

  static transform(
    a: RootChange,
    b: RootChange,
    replayBase?: DocumentIndex,
    readBack: ReadBack | null = null
  ) {
    return {
      a: transformChange(a, b, true, replayBase, readBack),
      b: transformChange(b, a, false, replayBase, readBack),
    };
  }

  private static carryAcrossMove(
    a: RootChange,
    b: RootChange,
    document: DocumentIndex,
    options: Parameters<typeof RootChange.transformInDocument>[3],
    runMoves: () => readonly [SiblingRunMove | null, SiblingRunMove | null]
  ) {
    if (changedRangesAreSeparated(a, b)) return null;

    const [aMove, bMove] = runMoves();

    if (aMove && bMove) return null;
    if (bMove) {
      const carried = RootChange.carryEditAcrossMove(
        a,
        b,
        bMove,
        document,
        options,
        true
      );

      return carried && { a: carried.edit, b: carried.move };
    }
    if (aMove) {
      const carried = RootChange.carryEditAcrossMove(
        b,
        a,
        aMove,
        document,
        options,
        false
      );

      return carried && { a: carried.move, b: carried.edit };
    }

    return null;
  }

  private static carryEditAcrossMove(
    edit: RootChange,
    moveChange: RootChange,
    move: SiblingRunMove,
    document: DocumentIndex,
    options: Parameters<typeof RootChange.transformInDocument>[3],
    editIsA: boolean
  ) {
    if (
      move.count !== 1 ||
      pathKey(move.path) === pathKey(move.targetPath) ||
      !isElementNode(document.node(move.path)) ||
      moveChange.propertyChanges().length > 0
    ) {
      return null;
    }

    const parts = edit.partition(move.from, move.to - 1);

    if (
      !parts ||
      parts.inside.empty ||
      !deletesAcrossLandingOnly(parts.outside, move)
    ) {
      return null;
    }

    const afterInside = parts.inside.apply(document);
    const moved = moveChangeAfterEdit(afterInside, move, parts.inside);

    if (!moved) return null;

    const carried = getDefined(
      parts.inside.within(move.from, move.to - 1)
    ).embed(moveChange.newLength, move.fromAfterMove);
    const outside = RootChange.transform(
      parts.outside,
      parts.inside
    ).a.withEmptyLinesRemoved(afterInside);
    const rest = editIsA
      ? RootChange.transformInDocument(outside, moved, afterInside, options)
      : RootChange.transformInDocument(moved, outside, afterInside, options);

    if (rest.keptWrap) return null;

    const outsideAfterMove = editIsA ? rest.a : rest.b;
    const moveAfterEdit = editIsA ? rest.b : rest.a;
    const residualReplacements = moveAfterEdit.replacements();
    const residual =
      residualReplacements.length === 2 &&
      siblingRunMove(edit.apply(document), residualReplacements);

    return {
      edit: carried.compose(outsideAfterMove),
      move:
        residual && pathKey(residual.path) === pathKey(residual.targetPath)
          ? RootChange.empty(moveAfterEdit.length)
          : moveAfterEdit,
    };
  }

  private withEmptyLinesRemoved(document: DocumentIndex) {
    const replacements = this.replacements();
    const properties = this.propertyChanges();
    const sections: RootChangeSection[] = [...replacements];
    let changed = false;

    replacements.forEach((join, index) => {
      const removal = emptyLineRemovalFor(document, join);

      if (!removal) return;

      const typed = replacements.filter(
        (other) => other !== join && meets(removal, other)
      );
      const moved = typingMovedToJoinStart(join, typed);

      if (!moved) return;

      sections[index] = removal;
      moved.forEach((replacement, at) => {
        sections[replacements.indexOf(getDefined(typed[at]))] = replacement;
      });
      changed = true;
    });

    if (!changed) return this;

    return RootChange.create(document, [
      ...sections,
      ...properties.map(({ from, modifications, to }) => ({
        from,
        properties: propertyDeltaFromModifications(modifications),
        to,
      })),
    ]);
  }

  /**
   * Two matching moves, or two structural edits that start together and give
   * one structure, become one edit unless `keepEqualEdits` keeps them as two.
   * The same whole blocks both insert at one place count once, and each
   * side's other edits rebase over them. Different ones both stay, the
   * first side's first when the two give one structure.
   * With `replay`, `b` is a recorded step replayed over `a`: a wrap of `a`
   * equal to its own stays its own, and a wrap a split cuts gives each next
   * piece the properties `replay.pieceProps` returns.
   */
  static transformInDocument(
    a: RootChange,
    b: RootChange,
    document: DocumentIndex,
    {
      keepEqualEdits = false,
      replay,
    }: Readonly<{
      keepEqualEdits?: boolean;
      replay?: Readonly<{
        anchor?: boolean;
        carriesLift?: boolean;
        pieceProps: PieceProps;
        readBack?: ReadBack | null;
      }>;
    }> = {}
  ): Readonly<{ a: RootChange; b: RootChange; keptWrap?: KeptWrap }> {
    const replayBase = replay && document;
    let runMoves:
      | readonly [SiblingRunMove | null, SiblingRunMove | null]
      | undefined;
    const readRunMoves = () =>
      (runMoves ??= [
        siblingRunMove(document, a.replacements()),
        siblingRunMove(document, b.replacements()),
      ]);
    const acrossMove = RootChange.carryAcrossMove(
      a,
      b,
      document,
      { keepEqualEdits, replay },
      readRunMoves
    );

    if (acrossMove) return acrossMove;

    const readBack = replay?.readBack ?? null;
    const inMovedLine =
      replay?.carriesLift && editsInMovedLine(a, b, document)
        ? rebaseOverLift(a, b, document, { keepEqualEdits, replay })
        : null;

    if (inMovedLine) {
      markReadBack(readBack);

      return inMovedLine;
    }

    const joined = rebaseOverJoins(a, b, document, replayBase, readBack);

    if (joined) return joined;

    const pieces = rebaseOverPieces(
      a,
      b,
      document,
      replay?.pieceProps,
      replayBase
    );

    if (pieces) return pieces;
    // Edits separated by unchanged content commute positionally. The
    // value-based repairs below exist for edits that touch, overlap or relocate
    // each other, and each costs O(document).
    if (changedRangesAreSeparated(a, b)) {
      return RootChange.transform(a, b, replayBase, readBack);
    }

    const aReplacements = a.replacements();
    const bReplacements = b.replacements();

    const wrapGoesWithReplaced = (wrapping: RootChange, other: RootChange) => {
      const rest = propertyWritesOf(wrapping);
      const over =
        rest.propertyChanges().length === 0
          ? { a: RootChange.empty(other.newLength), b: other }
          : RootChange.transformInDocument(rest, other, document, {
              keepEqualEdits,
              replay,
            });

      markReadBack(readBack);

      return {
        kept: over.a,
        other: wrapping.invert(document).compose(rest).compose(over.b),
      };
    };

    if (
      readBack &&
      wrapsInsideReplacement(aReplacements, bReplacements, document)
    ) {
      const { kept, other } = wrapGoesWithReplaced(a, b);

      return { a: kept, b: other };
    }
    if (
      readBack &&
      wrapsInsideReplacement(bReplacements, aReplacements, document)
    ) {
      const { kept, other } = wrapGoesWithReplaced(b, a);

      return { a: other, b: kept };
    }

    const absorbed = transformByPositionOverAbsorbedWraps(
      a,
      b,
      aReplacements,
      bReplacements,
      document,
      replayBase,
      readBack
    );

    if (absorbed) return absorbed;

    // The value repairs below would read a re-take of an unwrapped wrap,
    // which leaves the same value, as no edit at all.
    const bPutBack = putBackOver(aReplacements, bReplacements, document);

    if (bPutBack) {
      const afterB = b.apply(document);

      return {
        a: RootChange.empty(afterB.length),
        b: RootChange.create(a.apply(document), bPutBack),
      };
    }

    const aPutBack = putBackOver(bReplacements, aReplacements, document);

    if (aPutBack) {
      const afterA = a.apply(document);

      return {
        a: RootChange.create(b.apply(document), aPutBack),
        b: RootChange.empty(afterA.length),
      };
    }

    const aPropertyChanges = a.propertyChanges();
    const bPropertyChanges = b.propertyChanges();
    const [aReplacement] = aReplacements;
    const [bReplacement] = bReplacements;
    const contains = (
      outer: Replacement | undefined,
      inner: Replacement | undefined
    ) =>
      !!outer &&
      !!inner &&
      (inner.from === inner.to
        ? outer.from < inner.from && inner.to < outer.to
        : outer.from <= inner.from && inner.to <= outer.to);
    const containsAll = (outer: Replacement, inner: readonly Replacement[]) =>
      inner.length > 0 &&
      inner.every((replacement) => contains(outer, replacement));
    const [aRunMove, bRunMove] = readRunMoves();
    const aMove = aRunMove?.count === 1 ? aRunMove : null;
    const bMove = bRunMove?.count === 1 ? bRunMove : null;
    if (
      !keepEqualEdits &&
      aMove &&
      bMove &&
      pathKey(aMove.path) === pathKey(bMove.path) &&
      pathKey(aMove.targetPath) === pathKey(bMove.targetPath)
    ) {
      return {
        a: RootChange.empty(a.newLength),
        b: RootChange.empty(b.newLength),
      };
    }

    const carryThroughMove = (
      edit: RootChange,
      moveChange: RootChange,
      move: SiblingRunMove
    ) => {
      if (
        pathKey(move.path) === pathKey(move.targetPath) ||
        !isElementNode(document.node(move.path))
      ) {
        return null;
      }

      const parts = edit.partition(move.from, move.to - 1);

      if (!parts || parts.inside.empty) return null;

      let touchesNode = false;

      parts.outside.iterChangedRanges((from, to) => {
        if (to > move.from && from < move.to) touchesNode = true;
      });

      if (touchesNode) return null;

      const afterMove = moveChange.apply(document);
      const afterEdit = edit.apply(document);
      const carried = getDefined(
        parts.inside.within(move.from, move.to - 1)
      ).embed(afterMove.length, move.fromAfterMove);

      if (parts.outside.empty && moveChange.propertyChanges().length === 0) {
        const moved = moveChangeAfterEdit(afterEdit, move, edit);

        if (moved) return { edit: carried, move: moved };
      }

      if (move.count > 1) return null;

      const editAfterMove = carried.compose(
        RootChange.transform(
          RootChange.transform(parts.outside, moveChange).a,
          carried
        ).a
      );

      return {
        edit: editAfterMove,
        move: RootChange.between(afterEdit, editAfterMove.apply(afterMove)),
      };
    };

    const carriesOver = (
      move: SiblingRunMove | null,
      other: SiblingRunMove | null
    ): move is SiblingRunMove =>
      !!move && (move.count === 1 ? other?.count !== 1 : !other);

    if (carriesOver(bRunMove, aRunMove)) {
      const carried = carryThroughMove(a, b, bRunMove);

      if (carried) return { a: carried.edit, b: carried.move };
    }

    if (carriesOver(aRunMove, bRunMove)) {
      const carried = carryThroughMove(b, a, aRunMove);

      if (carried) return { a: carried.move, b: carried.edit };
    }

    const afterA = a.apply(document);
    const afterB = b.apply(document);
    const shared = keepEqualEdits
      ? null
      : sharedPlaceEdits(document, aReplacements, bReplacements);
    // A side whose every edit the other's result already holds, such as a
    // letter the other typed another way, adds nothing. A rebase over the
    // shared lines would type that letter twice.
    if (shared && keptIn(b, afterB, afterA)) {
      return {
        a: RootChange.between(afterB, afterA),
        b: RootChange.empty(afterA.length),
      };
    }
    if (shared && keptIn(a, afterA, afterB)) {
      return {
        a: RootChange.empty(afterB.length),
        b: RootChange.between(afterA, afterB),
      };
    }
    const rebaseAfterShared = (edits: ReadonlyMap<string, SharedEdit>) => {
      const rest = RootChange.transformInDocument(
        overSharedEdits(a, edits),
        overSharedEdits(b, edits),
        RootChange.create(
          document,
          [...edits.values()].map(({ from, merged, to }) => ({
            from,
            insert: merged,
            to,
          }))
        ).apply(document),
        { keepEqualEdits, replay }
      );

      return {
        ...rest,
        a: resultToSharedDocument(b, edits, 'second').compose(rest.a),
        b: resultToSharedDocument(a, edits, 'first').compose(rest.b),
      };
    };

    // Different blocks at one place go in the first side's first only in the
    // sameEdit branch below. Elsewhere, as when an undo puts back a quote
    // beside a teammate's new line at the quote's old place, they rebase as
    // plain inserts, and the repairs after them keep the quote first.
    const sameShared =
      shared && new Map([...shared].filter(([, { kind }]) => kind === 'same'));

    if (sameShared?.size) return rebaseAfterShared(sameShared);

    const wrapGoesWithMove = (
      edit: RootChange,
      moveChange: RootChange,
      move: SiblingRunMove
    ) => {
      const insertion = moveChange
        .replacements()
        .find(({ from, insert, to }) => from === to && insert.length > 0);
      const wraps = insertedElementsOf(edit, document).some(
        ({ close, open }) =>
          open.from === move.from &&
          open.to === move.from &&
          close.from === move.to &&
          close.to === move.to
      );

      if (!insertion || !wraps) return null;

      const afterEdit = edit.apply(document);
      const node = afterEdit.nodeStartingAt(
        getDefined(edit.mapPos(move.from, 1))
      );
      const wrapperPath = node?.path.slice(0, -1);

      if (!node || !wrapperPath?.length) return null;

      const wrapper = afterEdit.nodeRange(wrapperPath);
      const wrapperNode = afterEdit.node(wrapperPath);
      const target = edit.mapPos(insertion.from, -1);

      if (
        !isElementNode(wrapperNode) ||
        wrapperNode.children.length !== 1 ||
        target === null ||
        (wrapper.from <= target && target <= wrapper.to)
      ) {
        return null;
      }

      const wrapperMove = RootChange.create(afterEdit, [
        { from: wrapper.from, to: wrapper.to },
        { from: target, insert: afterEdit.slice(wrapper.from, wrapper.to) },
      ]);
      const writes = propertyWritesOf(moveChange);
      let inMoved = false;

      writes.iterChangedRanges((from, to) => {
        if (to > move.from && from < move.to) inMoved = true;
      });
      if (inMoved) return null;

      const moved = writes.propertyChanges().length
        ? wrapperMove.compose(
            RootChange.transform(
              RootChange.transform(writes, edit).a,
              wrapperMove
            ).a
          )
        : wrapperMove;

      return {
        edit: RootChange.between(
          moveChange.apply(document),
          moved.apply(afterEdit)
        ),
        move: moved,
      };
    };

    if (readBack && bMove && !aMove) {
      const wrapped = wrapGoesWithMove(a, b, bMove);
      const kept =
        wrapped &&
        convergedResult(document, a, b, { a: wrapped.edit, b: wrapped.move });

      if (kept) {
        markReadBack(readBack);

        return kept;
      }
    }

    if (readBack && aMove && !bMove) {
      const wrapped = wrapGoesWithMove(b, a, aMove);
      const kept =
        wrapped &&
        convergedResult(document, a, b, { a: wrapped.move, b: wrapped.edit });

      if (kept) {
        markReadBack(readBack);

        return kept;
      }
    }

    const transformed = RootChange.transform(a, b, replayBase, readBack);
    const aChangesStructure = !sameDocumentStructure(
      document.value,
      afterA.value
    );
    const bChangesStructure = !sameDocumentStructure(
      document.value,
      afterB.value
    );
    const sharesStructuralStart = aReplacements.some(({ from }) =>
      bReplacements.some((replacement) => replacement.from === from)
    );
    // Two edits that only add structure around letters, such as wraps of
    // neighboring letters, can give one shape over different letters.
    const sameEdit = () =>
      onlyAddsStructure(aReplacements) && onlyAddsStructure(bReplacements)
        ? jsonEqual(afterA.value, afterB.value)
        : sameDocumentStructure(afterA.value, afterB.value);

    const oneEdit =
      !keepEqualEdits &&
      (aChangesStructure || bChangesStructure) &&
      sharesStructuralStart &&
      sameEdit();
    const moveMeetsNonMove =
      readBack !== null && Boolean(aMove) !== Boolean(bMove);

    if (oneEdit && moveMeetsNonMove) markReadBack(readBack);
    if (oneEdit && !moveMeetsNonMove) {
      if (shared) return rebaseAfterShared(shared);

      const keepsReplayedWrap =
        replay !== undefined &&
        onlyAddsStructure(aReplacements) &&
        aReplacements.some(({ insert }) => opensEnclosure(insert));

      if (keepsReplayedWrap) {
        return {
          a: RootChange.empty(afterB.length),
          b: a.invert(document).compose(b),
        };
      }

      return {
        a: RootChange.between(afterB, afterA),
        b: RootChange.empty(afterA.length),
      };
    }

    // A wrap beside another edit that only adds structure, such as a split
    // at its edge, moves no letter, so positions place both. The value
    // repairs below read the split's letters as relocated and rewrite them.
    // A split between the wrap's edges would leave its element open across
    // the split, so positions cannot place that one.
    if (
      onlyAddsStructure(aReplacements) &&
      onlyAddsStructure(bReplacements) &&
      [...aReplacements, ...bReplacements].some(({ insert }) =>
        opensEnclosure(insert)
      ) &&
      !addsInsideEnclosure(aReplacements, bReplacements) &&
      !addsInsideEnclosure(bReplacements, aReplacements) &&
      convergesOn(transformed, afterA, afterB)
    ) {
      return transformed;
    }

    const bThroughStableA = bChangesStructure
      ? (mergeStructuralRunByPosition(
          b,
          a,
          aReplacements,
          document,
          afterB,
          afterA
        ) ??
        mergeStructuralChangeAtStableSiblingRange(document, afterB, afterA))
      : null;

    if (bThroughStableA !== null) {
      return {
        a: bThroughStableA.other,
        b: bThroughStableA.rebased,
      };
    }

    const aThroughStableB = aChangesStructure
      ? (mergeStructuralRunByPosition(
          a,
          b,
          bReplacements,
          document,
          afterA,
          afterB
        ) ??
        mergeStructuralChangeAtStableSiblingRange(document, afterA, afterB))
      : null;

    if (aThroughStableB !== null) {
      return {
        a: aThroughStableB.rebased,
        b: aThroughStableB.other,
      };
    }

    const aThroughB = bChangesStructure
      ? mergeNestedChangeThroughStructuralRelocation(
          a,
          b,
          document,
          afterA,
          afterB
        )
      : null;

    if (aThroughB !== null) {
      return {
        a: RootChange.between(afterB, aThroughB),
        b: RootChange.between(afterA, aThroughB),
      };
    }

    const bThroughA = aChangesStructure
      ? mergeNestedChangeThroughStructuralRelocation(
          b,
          a,
          document,
          afterB,
          afterA
        )
      : null;

    if (bThroughA !== null) {
      return {
        a: RootChange.between(afterB, bThroughA),
        b: RootChange.between(afterA, bThroughA),
      };
    }

    if (convergesOn(transformed, afterA, afterB)) return transformed;

    if (
      bMove &&
      aReplacements.length === 1 &&
      bMove.from <= aReplacement.from &&
      aReplacement.to < bMove.to
    ) {
      const moveAfterA = moveNodeChange(afterA, bMove.path, bMove.targetPath);
      const merged = moveAfterA.apply(afterA);

      return {
        a: RootChange.between(afterB, merged),
        b: moveAfterA,
      };
    }

    if (
      aMove &&
      bReplacements.length === 1 &&
      aMove.from <= bReplacement.from &&
      bReplacement.to < aMove.to
    ) {
      const moveAfterB = moveNodeChange(afterB, aMove.path, aMove.targetPath);
      const merged = moveAfterB.apply(afterB);

      return {
        a: moveAfterB,
        b: RootChange.between(afterA, merged),
      };
    }

    const keepOutsideDeletion = (
      deletion: Replacement,
      afterDeletion: DocumentIndex,
      propertyChanges: readonly PropertyChange[]
    ) => {
      const sections: number[] = [];
      const data: SectionData[] = [];
      let position = 0;

      for (const { from, modifications, to } of propertyChanges) {
        if (to > deletion.from && from < deletion.to) continue;
        const start =
          from < deletion.from ? from : from - (deletion.to - deletion.from);

        if (start > position) {
          addSection(sections, data, start - position, -1, null);
        }
        addSection(sections, data, to - from, -2, modifications);
        position = start + to - from;
      }
      if (position < afterDeletion.length) {
        addSection(sections, data, afterDeletion.length - position, -1, null);
      }

      return RootChange.fromSections(sections, data).apply(afterDeletion);
    };
    const deletion =
      bReplacements.length === 1 &&
      deletesWholeSiblings(document, bReplacement) &&
      containsAll(bReplacement, aReplacements)
        ? {
            edit: a,
            kept: aPropertyChanges,
            replacement: bReplacement,
            side: 'b' as const,
          }
        : aReplacements.length === 1 &&
            deletesWholeSiblings(document, aReplacement) &&
            containsAll(aReplacement, bReplacements)
          ? {
              edit: b,
              kept: bPropertyChanges,
              replacement: aReplacement,
              side: 'a' as const,
            }
          : null;

    if (deletion) {
      const [afterEdit, afterDeletion] =
        deletion.side === 'b' ? [afterA, afterB] : [afterB, afterA];
      const merged = keepOutsideDeletion(
        deletion.replacement,
        afterDeletion,
        deletion.kept
      );
      const deletionAfterEdit = RootChange.create(afterEdit, {
        from: deletion.replacement.from,
        to:
          deletion.replacement.to +
          deletion.edit.newLength -
          deletion.edit.length,
      });
      const deleted = deletionAfterEdit.compose(
        RootChange.between(deletionAfterEdit.apply(afterEdit), merged)
      );
      const edited = RootChange.between(afterDeletion, merged);

      return deletion.side === 'b'
        ? { a: edited, b: deleted }
        : { a: deleted, b: edited };
    }

    const overRemoval = transformMixedEditOverSiblingRemoval(
      a,
      b,
      aReplacements,
      bReplacements,
      document,
      afterA,
      afterB
    );

    if (overRemoval) return overRemoval;

    const soleWrap = soleWrapProps(aReplacements, document);
    const bHoldsEdit =
      readBack &&
      !keepEqualEdits &&
      aPropertyChanges.length === 0 &&
      (insertsWithin(a, b, aReplacements, bReplacements, document) ||
        (soleWrap !== null &&
          bPropertyChanges.some(
            ({ from, modifications }) =>
              from < getDefined(aReplacements[0]).from &&
              document.nodeStartingAt(from)?.to !== undefined &&
              getDefined(aReplacements[1]).from <
                getDefined(document.nodeStartingAt(from)).to &&
              modifications.some(
                (modification) =>
                  modification.key === 'type' &&
                  modification.type === 'set' &&
                  modification.value === soleWrap.type
              )
          )));

    if (bHoldsEdit && liftOf(b, document)) {
      markReadBack(readBack);

      return {
        a: RootChange.empty(afterB.length),
        b: a.invert(document).compose(b),
      };
    }

    const lifted =
      readBack && !bHoldsEdit
        ? rebaseOverLift(a, b, document, { keepEqualEdits, replay })
        : null;

    if (lifted) {
      markReadBack(readBack);

      return lifted;
    }

    const wrap = replay?.anchor ? soleWrap : null;
    const anchored =
      wrap &&
      RootChange.keepOverWrittenBack(a, b, document, afterA, afterB, wrap);

    if (anchored) return anchored;

    return {
      a: RootChange.empty(afterB.length),
      b: RootChange.between(afterA, afterB),
    };
  }

  private static keepOverWrittenBack(
    a: RootChange,
    b: RootChange,
    document: DocumentIndex,
    afterA: DocumentIndex,
    afterB: DocumentIndex,
    wrap: Readonly<JsonRecord>
  ) {
    try {
      const step = b.keepWrittenBackCloses(document);

      if (!step || addsElementOrRetypesTo(b, wrap.type)) return null;

      const kept = RootChange.transform(a, step);

      if (!jsonEqual(kept.b.apply(afterA).value, kept.a.apply(afterB).value)) {
        return null;
      }

      return { ...kept, keptWrap: { props: wrap } };
    } catch {
      return null;
    }
  }

  get empty() {
    return (
      this.sections.length === 0 ||
      (this.sections.length === 2 && this.sections[1] === -1)
    );
  }

  isNoopOn(document: DocumentIndex) {
    let position = 0;

    for (let index = 0; index < this.sections.length;) {
      if (this.sections[index + 1] === -1) {
        position += this.sections[index];
        index += 2;
        continue;
      }

      const from = position;
      const first = index;
      let insertedLength = 0;

      while (index < this.sections.length && this.sections[index + 1] !== -1) {
        if (this.sections[index + 1] === -2) return false;

        position += this.sections[index];
        insertedLength += this.sections[index + 1];
        index += 2;
      }

      if (insertedLength !== position - from) return false;

      const replacement = PreparedTokenSlice.concat(
        this.data
          .slice(first >> 1, index >> 1)
          .map(
            (slice) =>
              (slice as PreparedTokenSlice | null) ?? PreparedTokenSlice.empty
          )
      );

      if (
        !jsonEqual(
          replacement.toJSON(),
          document.slice(from, position).toJSON()
        )
      ) {
        return false;
      }
    }

    return true;
  }

  pureDeletionOn(document: DocumentIndex): readonly [number, number] | null {
    const replacements = this.replacements();
    const last = replacements.at(-1);

    if (
      !last ||
      this.propertyChanges().length > 0 ||
      replacements.some(
        (replacement, index) =>
          index > 0 && replacement.from !== replacements[index - 1].to
      )
    ) {
      return null;
    }

    const { from } = replacements[0];
    const { to } = last;
    const written = PreparedTokenSlice.concat(
      replacements.map((replacement) => replacement.insert)
    );

    if (written.length >= to - from) return null;

    const removed = document.slice(from, to);

    const writesBack = (removedAt: number, writtenAt: number) =>
      jsonEqual(
        removed.slice(removedAt, removedAt + 1).toJSON(),
        written.slice(writtenAt, writtenAt + 1).toJSON()
      );
    let head = 0;

    while (head < written.length && writesBack(head, head)) head += 1;

    let tail = 0;

    while (
      head + tail < written.length &&
      writesBack(removed.length - 1 - tail, written.length - 1 - tail)
    ) {
      tail += 1;
    }

    return head + tail === written.length ? [from + head, to - tail] : null;
  }

  keepWrittenBackCloses(document: DocumentIndex): RootChange | null {
    const sections: number[] = [];
    const data: SectionData[] = [];
    let changed = false;
    let position = 0;

    for (let index = 0; index < this.sections.length;) {
      const first = index;
      const from = position;

      do {
        position += this.sections[index];
        index += 2;
      } while (
        this.sections[first + 1] >= 0 &&
        index < this.sections.length &&
        this.sections[index + 1] >= 0
      );

      const insert =
        this.sections[first + 1] >= 0
          ? PreparedTokenSlice.concat(
              this.data
                .slice(first >> 1, index >> 1)
                .map(
                  (slice) =>
                    (slice as PreparedTokenSlice | null) ??
                    PreparedTokenSlice.empty
                )
            )
          : null;
      const written =
        insert &&
        writtenBackCloses(document.slice(from, position).tokens, insert.tokens);

      if (!insert || !written) {
        for (let at = first; at < index; at += 2) {
          addSection(
            sections,
            data,
            this.sections[at],
            this.sections[at + 1],
            this.data[at >> 1]
          );
        }
        continue;
      }

      const { offsets } = insert;
      const rest =
        written.insertEnd < offsets.length
          ? offsets[written.insertEnd]
          : insert.length;
      const lead = offsets[written.insertEnd - written.keptCloses];

      changed = true;
      addSection(
        sections,
        data,
        position - written.keptCloses - from,
        lead,
        insert.slice(0, lead)
      );
      addSection(sections, data, written.keptCloses, -1, null);
      if (rest < insert.length) {
        addSection(sections, data, 0, insert.length - rest, insert.slice(rest));
      }
    }

    return changed ? RootChange.fromSections(sections, data) : null;
  }

  /** @internal */
  alignOpens(
    document: DocumentIndex,
    aligns: (
      before: Readonly<JsonRecord>,
      after: Readonly<JsonRecord>
    ) => boolean
  ): RootChange {
    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;
    let aligned = false;

    for (let index = 0; index < this.sections.length; index += 2) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];
      const value = this.data[index / 2];
      let kept = 0;

      if (inserted > 0 && length > 0 && value instanceof PreparedTokenSlice) {
        const removed = document.slice(position, position + length).tokens;
        const insert = value.tokens;

        while (kept < removed.length && kept < insert.length) {
          const before = removed[kept];
          const after = insert[kept];

          if (
            before.kind !== 'open' ||
            after.kind !== 'open' ||
            before.nodeKind !== after.nodeKind ||
            !aligns(before.props, after.props)
          ) {
            break;
          }

          const modifications = semanticPropertyModifications(
            before.props,
            after.props,
            () => false
          );

          addSection(
            sections,
            data,
            1,
            modifications.length > 0 ? -2 : -1,
            modifications.length > 0 ? modifications : null
          );
          kept += 1;
        }
      }

      if (kept === 0) {
        addSection(sections, data, length, inserted, value);
      } else {
        aligned = true;
        const rest = (value as PreparedTokenSlice).slice(kept);

        addSection(sections, data, length - kept, rest.length, rest);
      }
      position += length;
    }

    return aligned ? new RootChange(sections, data) : this;
  }

  private applyIndexed(
    document: DocumentIndex,
    replacements: readonly Replacement[],
    propertyChanges: readonly PropertyChange[],
    work: MutableChangeSetApplyWork
  ) {
    if (propertyChanges.length > 0) {
      if (replacements.length > 0) {
        work.fallbackReason = 'mixed-properties-and-replacements';

        return null;
      }

      const updates: Array<{
        path: readonly number[];
        props: JsonRecord;
      }> = [];

      for (const propertyChange of propertyChanges) {
        const entry = document.nodeStartingAt(propertyChange.from);

        if (!entry || propertyChange.to !== propertyChange.from + 1) {
          work.fallbackReason = 'invalid-property-target';

          return null;
        }

        const node = document.node(entry.path);

        updates.push({
          path: entry.path,
          props: applyPropertyModifications(
            nodeProps(node),
            propertyChange.modifications
          ),
        });
        work.ancestorPaths.push([...entry.path]);
      }

      return document.withNodeUpdates(updates);
    }

    const enclosed = enclosureApplied(document, replacements);

    if (enclosed) {
      work.ancestorPaths.push([...enclosed.parent]);
      work.localizedReplacements = 2;

      return enclosed.after;
    }

    if (replacements.length === 2) {
      const deletion = replacements.find(
        (replacement) =>
          replacement.from < replacement.to && replacement.insert.length === 0
      );
      const insertion = replacements.find(
        (replacement) =>
          replacement.from === replacement.to && replacement.insert.length > 0
      );

      if (deletion && insertion) {
        const source = document.nodeStartingAt(deletion.from);
        const target = document.childBoundaryAt(insertion.from);

        if (source?.to === deletion.to && target) {
          try {
            const inserted = decodeNodes(insertion.insert).nodes;
            const sourceNode = document.node(source.path);

            if (inserted.length === 1 && jsonEqual(inserted[0], sourceNode)) {
              const sourceParent = source.path.slice(0, -1);
              const sourceIndex = getDefined(source.path.at(-1));
              const sameParent =
                pathKey(sourceParent) === pathKey(target.parentPath);
              const targetIndex =
                sameParent && sourceIndex < target.index
                  ? target.index - 1
                  : target.index;

              work.ancestorPaths.push(
                [...sourceParent],
                [...target.parentPath]
              );
              work.localizedReplacements = 2;

              return document.withMovedNode(source.path, [
                ...target.parentPath,
                targetIndex,
              ]);
            }
          } catch {
            // Fall through to canonical token application.
          }
        }
      }
    }

    const replacementsByPosition = sortJoiningInsertions(replacements);

    for (let index = 1; index < replacementsByPosition.length; index++) {
      const previous = replacementsByPosition[index - 1];
      const replacement = replacementsByPosition[index];

      if (previous.from === replacement.from) {
        work.fallbackReason = 'ambiguous-replacement-position';

        return null;
      }
      if (previous.to > replacement.from) {
        work.fallbackReason = 'overlapping-replacement-range';

        return null;
      }
    }

    if (replacementsByPosition.length > 1) {
      const updates = new Map<
        string,
        { path: readonly number[]; text: string }
      >();
      const paths: number[][] = [];

      for (const replacement of replacementsByPosition.toReversed()) {
        const entry = document.textAt(replacement.from);

        if (
          !entry ||
          entry.contentFrom > replacement.from ||
          replacement.to > entry.contentTo ||
          !replacement.insert.tokens.every((token) => token.kind === 'text')
        ) {
          break;
        }

        const node = document.node(entry.path);

        if (!isTextNode(node)) break;
        const key = pathKey(entry.path);
        const previous = updates.get(key)?.text ?? node.text;
        const inserted = replacement.insert.tokens
          .map((token) => (token.kind === 'text' ? token.text : ''))
          .join('');

        updates.set(key, {
          path: entry.path,
          text:
            previous.slice(0, replacement.from - entry.contentFrom) +
            inserted +
            previous.slice(replacement.to - entry.contentFrom),
        });
        paths.push([...entry.path]);
      }

      if (paths.length === replacementsByPosition.length) {
        for (const path of paths) work.ancestorPaths.push(path);
        work.localizedReplacements += paths.length;
        return document.withNodeUpdates([...updates.values()]);
      }
    }

    let current = document;
    const recordLocality = (path: readonly number[], replacementCount = 1) => {
      work.ancestorPaths.push([...path]);
      work.localizedReplacements += replacementCount;

      return true;
    };
    const ancestorContains = (
      ancestor: Readonly<{ from: number; to: number }>,
      { from, to }: Replacement
    ) =>
      ancestor.from <= from &&
      to <= ancestor.to &&
      (from !== to || (ancestor.from < from && from < ancestor.to));

    const unapplied = [...replacementsByPosition];

    while (unapplied.length > 0) {
      const replacement = getDefined(unapplied.pop());
      const preparedNodes = DOCUMENT_SLICE_PREPARED_NODES.get(
        replacement.insert
      );
      const fromBoundary = current.childBoundaryAt(replacement.from);
      const toBoundary = current.childBoundaryAt(replacement.to);

      if (
        preparedNodes &&
        fromBoundary &&
        toBoundary &&
        pathKey(fromBoundary.parentPath) === pathKey(toBoundary.parentPath) &&
        claimPreparedNodeSlice(preparedNodes.nodes)
      ) {
        if (!recordLocality(fromBoundary.parentPath)) return null;
        current = profileCoreDuration('change-set-local-splice', () =>
          current.withPreparedSplicedNodes(
            fromBoundary.parentPath,
            fromBoundary.index,
            toBoundary.index - fromBoundary.index,
            preparedNodes
          )
        );
        continue;
      }

      const text = replacement.insert.tokens.every(
        (token) => token.kind === 'text'
      )
        ? replacement.insert.tokens
            .map((token) => (token.kind === 'text' ? token.text : ''))
            .join('')
        : null;
      const textEntry = current.textAt(replacement.from);

      if (
        text !== null &&
        textEntry &&
        textEntry.contentFrom <= replacement.from &&
        replacement.to <= textEntry.contentTo
      ) {
        if (!recordLocality(textEntry.path)) return null;
        current = current.withText(
          textEntry.path,
          replacement.from - textEntry.contentFrom,
          replacement.to - textEntry.contentFrom,
          text
        );
        continue;
      }

      const insertedTokens = replacement.insert.tokens;
      const nodeEntry = current.nodeStartingAt(replacement.from);

      if (
        replacement.to === replacement.from + 1 &&
        insertedTokens.length === 1 &&
        insertedTokens[0]?.kind === 'open' &&
        nodeEntry?.kind === insertedTokens[0].nodeKind
      ) {
        if (!recordLocality(nodeEntry.path)) return null;
        current = current.withExactNodeProperties(
          nodeEntry.path,
          insertedTokens[0].props
        );
        continue;
      }

      let insertedNodes: readonly JsonNode[] | null = null;

      try {
        insertedNodes = profileCoreDuration(
          'change-set-local-decode',
          () =>
            decodeNodes(replacement.insert, [], {
              reuseUnpreparedSources: false,
            }).nodes
        );
      } catch {
        // An open structural fragment may only decode with its local ancestor.
      }

      if (
        fromBoundary &&
        toBoundary &&
        insertedNodes &&
        pathKey(fromBoundary.parentPath) === pathKey(toBoundary.parentPath)
      ) {
        if (!recordLocality(fromBoundary.parentPath)) return null;
        current = profileCoreDuration('change-set-local-splice', () =>
          current.withDecodedSplicedNodes(
            fromBoundary.parentPath,
            fromBoundary.index,
            toBoundary.index - fromBoundary.index,
            insertedNodes
          )
        );
        continue;
      }

      if (insertedNodes && nodeEntry?.to === replacement.to) {
        const index = getDefined(nodeEntry.path.at(-1));
        const parentPath = nodeEntry.path.slice(0, -1);

        if (!recordLocality(parentPath)) return null;
        current = profileCoreDuration('change-set-local-splice', () =>
          current.withDecodedSplicedNodes(parentPath, index, 1, insertedNodes)
        );
        continue;
      }

      if (
        insertedNodes &&
        replacement.from === replacement.to &&
        insertedNodes.length > 0
      ) {
        const boundary = current.childBoundaryAt(replacement.from);

        if (boundary) {
          if (!recordLocality(boundary.parentPath)) return null;
          current = profileCoreDuration('change-set-local-splice', () =>
            current.withDecodedSplicedNodes(
              boundary.parentPath,
              boundary.index,
              0,
              insertedNodes
            )
          );
          continue;
        }
      }

      const fromContext = current.openContextAt(replacement.from);
      const toPaths = new Set(
        current
          .openContextAt(replacement.to)
          .map((entry) => pathKey(entry.path))
      );
      const ancestors = [...fromContext]
        .reverse()
        .filter(
          (entry) =>
            toPaths.has(pathKey(entry.path)) &&
            ancestorContains(entry, replacement)
        );

      let localized = false;

      for (const ancestor of ancestors) {
        let first = unapplied.length;

        while (first > 0 && ancestorContains(ancestor, unapplied[first - 1])) {
          first -= 1;
        }
        const batch = [...unapplied.slice(first), replacement];

        try {
          const ancestorSlice = current.nodeSlice(ancestor.path);
          const pieces: PreparedTokenSlice[] = [];
          let position = 0;

          for (const { from, insert, to } of batch) {
            pieces.push(
              ancestorSlice.slice(position, from - ancestor.from),
              insert
            );
            position = to - ancestor.from;
          }
          pieces.push(ancestorSlice.slice(position));
          const local = PreparedTokenSlice.concat(pieces);
          const nodes = profileCoreDuration(
            'change-set-local-decode',
            () => decodeNodes(local).nodes
          );
          const index = getDefined(ancestor.path.at(-1));

          if (!recordLocality(ancestor.path, batch.length)) return null;
          current = profileCoreDuration('change-set-local-splice', () =>
            current.withDecodedSplicedNodes(
              ancestor.path.slice(0, -1),
              index,
              1,
              nodes
            )
          );
          unapplied.length = first;
          localized = true;
          break;
        } catch {
          // Open slices may need a wider shared ancestor to become balanced.
        }
      }

      if (localized) continue;

      const topLevelRanges = current
        .nodeRangesTouching(replacement.from, replacement.to)
        .filter((entry) => entry.path.length === 1);
      const firstTopLevelIndex = Math.min(
        ...topLevelRanges.map((entry) => entry.path[0])
      );
      const lastTopLevelIndex = Math.max(
        ...topLevelRanges.map((entry) => entry.path[0])
      );

      if (
        Number.isFinite(firstTopLevelIndex) &&
        Number.isFinite(lastTopLevelIndex)
      ) {
        const firstRange = current.nodeRange([firstTopLevelIndex]);
        const lastRange = current.nodeRange([lastTopLevelIndex]);

        if (
          firstRange.from <= replacement.from &&
          replacement.to <= lastRange.to
        ) {
          try {
            const local = PreparedTokenSlice.concat([
              current.slice(firstRange.from, replacement.from),
              replacement.insert,
              current.slice(replacement.to, lastRange.to),
            ]);
            const nodes = profileCoreDuration(
              'change-set-local-root-window-decode',
              () => decodeNodes(local).nodes
            );

            if (!recordLocality([])) return null;
            current = profileCoreDuration(
              'change-set-local-root-window-splice',
              () =>
                current.withDecodedSplicedNodes(
                  [],
                  firstTopLevelIndex,
                  lastTopLevelIndex - firstTopLevelIndex + 1,
                  nodes
                )
            );
            continue;
          } catch {
            // The replacement needs the complete document token context.
          }
        }
      }

      work.fallbackReason = 'unresolved-local-replacement';

      return null;
    }

    return current;
  }

  private replacements() {
    const replacements: Replacement[] = [];
    let position = 0;

    for (let index = 0, dataIndex = 0; index < this.sections.length;) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];
      const data = this.data[dataIndex];

      index += 2;
      dataIndex += 1;

      if (inserted >= 0) {
        replacements.push({
          from: position,
          insert: (data ?? PreparedTokenSlice.empty) as PreparedTokenSlice,
          to: position + length,
        });
      }

      position += length;
    }

    return replacements;
  }

  private propertyChanges() {
    const changes: PropertyChange[] = [];
    let position = 0;

    for (let index = 0, dataIndex = 0; index < this.sections.length;) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];
      const data = this.data[dataIndex];

      index += 2;
      dataIndex += 1;

      if (inserted === -2) {
        changes.push({
          from: position,
          modifications: data as readonly PropertyModification[],
          to: position + length,
        });
      }

      position += length;
    }

    return changes;
  }

  exactMove(document: DocumentIndex) {
    return this.propertyChanges().length === 0
      ? this.movedNode(document)
      : null;
  }

  movedNode(document: DocumentIndex): Readonly<{
    path: readonly number[];
    targetPath: readonly number[];
  }> | null {
    const replacements = this.replacements();

    if (replacements.length !== 2) return null;

    const deletion = replacements.find(
      (replacement) =>
        replacement.from < replacement.to && replacement.insert.length === 0
    );
    const insertion = replacements.find(
      (replacement) =>
        replacement.from === replacement.to && replacement.insert.length > 0
    );

    if (!deletion || !insertion) return null;

    const source = document.nodeStartingAt(deletion.from);
    const target = document.childBoundaryAt(insertion.from);

    if (!source || source.to !== deletion.to || !target) return null;

    try {
      const inserted = decodeNodes(insertion.insert).nodes;
      const sourceNode = document.node(source.path);

      if (inserted.length !== 1 || !jsonEqual(inserted[0], sourceNode)) {
        return null;
      }

      const sourceParent = source.path.slice(0, -1);
      const sourceIndex = getDefined(source.path.at(-1));
      const sameParent = pathKey(sourceParent) === pathKey(target.parentPath);
      const targetIndex =
        sameParent && sourceIndex < target.index
          ? target.index - 1
          : target.index;
      const targetParent = transformPathAfterRemove(
        target.parentPath,
        source.path
      );

      if (!targetParent) return null;

      return Object.freeze({
        path: Object.freeze([...source.path]),
        targetPath: Object.freeze([...targetParent, targetIndex]),
      });
    } catch {
      return null;
    }
  }

  apply(document: DocumentIndex) {
    return profileCoreDuration('change-set-apply', () =>
      this.applyInternal(document)
    );
  }

  private applyInternal(document: DocumentIndex) {
    if (document.length !== this.length) {
      throw new Error(
        `Cannot apply change length ${this.length} to document length ${document.length}.`
      );
    }

    if (this.empty) return document;

    const replacements = this.replacements();
    const propertyChanges = this.propertyChanges();
    const changedRanges: Array<{
      fromAfter: number;
      fromBefore: number;
      toAfter: number;
      toBefore: number;
    }> = [];
    const work: MutableChangeSetApplyWork = {
      ancestorPaths: [],
      fallbackReason: null,
      localizedReplacements: 0,
    };

    this.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
      changedRanges.push({ fromAfter, fromBefore, toAfter, toBefore });
    });

    const recordStats = (usedTokenFallback: boolean) => {
      CHANGE_SET_APPLY_STATS.set(
        this,
        Object.freeze({
          ancestorPaths: Object.freeze(
            work.ancestorPaths.map((path) => Object.freeze([...path]))
          ),
          changedRanges: Object.freeze(
            changedRanges.map((range) => Object.freeze({ ...range }))
          ),
          fallbackReason: work.fallbackReason,
          localizedReplacements: work.localizedReplacements,
          propertyChanges: propertyChanges.length,
          replacements: replacements.length,
          usedTokenFallback,
        })
      );
    };
    const indexed = profileCoreDuration('change-set-apply-indexed', () => {
      if (propertyChanges.length === 0 || replacements.length === 0) {
        return this.applyIndexed(document, replacements, propertyChanges, work);
      }

      // A property edit keeps every token position, so the properties apply
      // first and the replacements then apply at their own positions.
      const withProperties = this.applyIndexed(
        document,
        [],
        propertyChanges,
        work
      );

      return withProperties
        ? this.applyIndexed(withProperties, replacements, [], work)
        : null;
    });

    if (indexed) {
      recordStats(false);

      return indexed;
    }

    profileCoreDuration(
      `change-set-apply-token-fallback:${work.fallbackReason ?? 'unknown'}`,
      () => undefined
    );

    return profileCoreDuration('change-set-apply-token-fallback', () => {
      const outputTokens: JsonToken[] = [];
      let position = 0;

      const append = (slice: PreparedTokenSlice) => {
        for (const token of slice.tokens) outputTokens.push(token);
      };

      for (let index = 0, dataIndex = 0; index < this.sections.length;) {
        const length = this.sections[index];
        const inserted = this.sections[index + 1];
        const value = this.data[dataIndex];

        index += 2;
        dataIndex += 1;

        const source = document.slice(position, position + length);

        append(
          inserted === -1
            ? source
            : inserted === -2
              ? applyPropertyModificationsToSlice(
                  source,
                  value as readonly PropertyModification[]
                )
              : ((value ?? PreparedTokenSlice.empty) as PreparedTokenSlice)
        );
        position += length;
      }

      if (position !== document.length) {
        throw new Error('RootChange does not cover the source document.');
      }

      const outputRanges: ChangedOutputRange[] = [];

      for (const { fromAfter, toAfter } of changedRanges) {
        outputRanges.push([fromAfter, toAfter]);
      }
      recordStats(true);

      return DocumentIndex.fromChangedTokens(
        PreparedTokenSlice.fromTokens(outputTokens),
        outputRanges
      );
    });
  }

  compose(other: RootChange) {
    if (this.newLength !== other.length) {
      throw new Error('Cannot compose mismatched change-set lengths.');
    }

    const { data, sections } = composeSections(
      this.sections,
      this.data,
      other.sections,
      other.data
    );

    return new RootChange(sections, data);
  }

  /** Invert a change that only inserts tokens without reading the document. */
  invertInsertions() {
    const sections: number[] = [];
    const data: SectionData[] = [];

    for (let index = 0; index < this.sections.length; index += 2) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];

      if (inserted === -1) {
        addSection(sections, data, length, -1, null);
        continue;
      }
      if (inserted < 0 || length !== 0) return null;
      addSection(sections, data, inserted, 0, PreparedTokenSlice.empty);
    }

    return new RootChange(sections, data);
  }

  /** Resize only the unchanged trailing document region. */
  resizeTrailingDocument(length: number) {
    if (!Number.isSafeInteger(length) || length < 0) return null;
    if (length === this.length) return this;
    if (length > this.length) return this.embed(length, 0);
    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;

    for (let index = 0, dataIndex = 0; index < this.sections.length;) {
      const sectionLength = this.sections[index];
      const inserted = this.sections[index + 1];
      const value = this.data[dataIndex];

      index += 2;
      dataIndex += 1;
      if (inserted !== -1) {
        if (position > length || position + sectionLength > length) {
          return null;
        }
        addSection(sections, data, sectionLength, inserted, value);
      } else if (position < length) {
        addSection(
          sections,
          data,
          Math.min(sectionLength, length - position),
          -1,
          null
        );
      }
      position += sectionLength;
    }

    return new RootChange(sections, data);
  }

  invert(document: DocumentIndex) {
    if (document.length !== this.length) {
      throw new Error('Cannot invert against a mismatched document.');
    }

    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;

    for (let index = 0; index < this.sections.length; index += 2) {
      let length = this.sections[index];
      const inserted = this.sections[index + 1];

      if (inserted === -1) {
        addSection(sections, data, length, -1, null);
      } else if (inserted === -2) {
        const entry = document.nodeStartingAt(position);

        if (!entry || length !== 1) {
          throw new Error('Cannot invert an invalid node property delta.');
        }

        addSection(
          sections,
          data,
          1,
          -2,
          invertPropertyModifications(
            nodeProps(document.node(entry.path)),
            this.data[index >> 1] as readonly PropertyModification[]
          )
        );
      } else if (inserted === 0) {
        while (this.sections[index + 3] === 0) {
          index += 2;
          length += this.sections[index];
        }
        addSection(
          sections,
          data,
          0,
          length,
          document.slice(position, position + length)
        );
      } else {
        const original =
          length === 0
            ? PreparedTokenSlice.empty
            : document.slice(position, position + length);

        addSection(sections, data, inserted, length, original);
      }

      position += length;
    }

    return new RootChange(sections, data);
  }

  /**
   * Bind existing runtime identities to node openings inserted by this change.
   *
   * @internal
   */
  withInsertedNodeKeys(
    after: DocumentIndex,
    nodeKeyAt: (path: readonly number[]) => NodeKey | null
  ) {
    if (after.length !== this.newLength) {
      throw new Error('Cannot bind node keys against a mismatched document.');
    }
    const data = [...this.data];
    let changed = false;
    let outputPosition = 0;

    for (
      let sectionIndex = 0, dataIndex = 0;
      sectionIndex < this.sections.length;
      dataIndex++
    ) {
      const length = this.sections[sectionIndex];
      const inserted = this.sections[sectionIndex + 1];

      sectionIndex += 2;
      const outputLength = inserted < 0 ? length : inserted;
      const value = data[dataIndex];

      if (
        inserted > 0 &&
        value instanceof PreparedTokenSlice &&
        value.length === inserted
      ) {
        const from = after.childBoundaryAt(outputPosition);
        const to = after.childBoundaryAt(outputPosition + inserted);

        if (
          from &&
          to &&
          pathKey(from.parentPath) === pathKey(to.parentPath) &&
          from.index < to.index
        ) {
          const children =
            from.parentPath.length === 0
              ? after.value
              : (() => {
                  const parent = after.node(from.parentPath);

                  return isElementNode(parent) ? parent.children : [];
                })();
          const nodes = children.slice(from.index, to.index);
          const prepared = PreparedTokenSlice.fromPreparedNodes(nodes, (path) =>
            nodeKeyAt([
              ...from.parentPath,
              from.index + path[0],
              ...path.slice(1),
            ])
          );

          if (prepared.length === inserted) {
            data[dataIndex] = prepared;
            changed = true;
          }
        } else if (value.tokens.some((token) => token.kind === 'open')) {
          const keys = new Map<number, NodeKey>();

          value.tokens.forEach((token, index) => {
            if (token.kind !== 'open') return;

            const offset = value.offsets[index];
            const node = after.nodeStartingAt(outputPosition + offset);
            const key = node && nodeKeyAt(node.path);

            if (key) keys.set(offset, key);
          });
          data[dataIndex] = value.withNodeKeys(keys);
          changed = true;
        }
      }

      outputPosition += outputLength;
    }

    return changed ? new RootChange(this.sections, data) : this;
  }

  *insertedSlices(): Generator<
    readonly [fromB: number, slice: PreparedTokenSlice]
  > {
    for (
      let index = 0, position = 0;
      index < this.sections.length;
      index += 2
    ) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];
      const slice = this.data[index / 2];

      if (inserted > 0 && slice instanceof PreparedTokenSlice) {
        yield [position, slice];
      }
      position += inserted < 0 ? length : inserted;
    }
  }

  iterChangedRanges(
    visit: (fromA: number, toA: number, fromB: number, toB: number) => void
  ) {
    let positionA = 0;
    let positionB = 0;

    for (let index = 0; index < this.sections.length;) {
      let length = this.sections[index];
      let inserted = this.sections[index + 1];

      index += 2;

      if (inserted === -1) {
        positionA += length;
        positionB += length;
        continue;
      }

      if (inserted === -2) inserted = length;

      while (index < this.sections.length && this.sections[index + 1] !== -1) {
        length += this.sections[index];
        const added = this.sections[index + 1];

        index += 2;

        inserted += added === -2 ? this.sections[index - 2] : added;
      }

      visit(positionA, positionA + length, positionB, positionB + inserted);
      positionA += length;
      positionB += inserted;
    }
  }

  mapPos(
    position: number,
    assoc: -1 | 1 = -1,
    track?: TrackMode
  ): number | null {
    // No section ending before the position can answer it, so the walk
    // starts at the first one that ends at or past it.
    const ends = sectionEndsOf(this);
    const first = firstSectionEnding(ends.endA, position, true);
    let positionA =
      first < ends.startA.length ? ends.startA[first] : this.length;
    let positionB =
      first < ends.startB.length ? ends.startB[first] : this.newLength;

    for (let index = first * 2; index < this.sections.length;) {
      const length = this.sections[index];
      const inserted = this.sections[index + 1];

      index += 2;
      const endA = positionA + length;

      if (inserted < 0) {
        if (endA > position) return positionB + position - positionA;
        positionB += length;
      } else {
        if (
          track &&
          endA >= position &&
          ((track === 'around' && positionA < position && endA > position) ||
            (track === 'before' && positionA < position) ||
            (track === 'after' && endA > position))
        ) {
          return null;
        }

        if (
          endA > position ||
          (endA === position && assoc < 0 && length === 0)
        ) {
          return position === positionA || assoc < 0
            ? positionB
            : positionB + inserted;
        }

        positionB += inserted;
      }

      positionA = endA;
    }

    if (position > positionA) {
      throw new RangeError(
        `Position ${position} exceeds RootChange length ${positionA}.`
      );
    }

    return positionB;
  }

  toJSON(): RootChangeJson {
    return this.data.map((value, index) => {
      const length = this.sections[index * 2];
      const inserted = this.sections[index * 2 + 1];

      if (inserted === -1) return { length };
      if (inserted === -2) {
        return {
          length,
          properties: {
            operations: (value as readonly PropertyModification[]).map(
              propertyModificationToJSON
            ),
            version: 1,
          },
        };
      }

      return {
        length,
        replacement: (value as PreparedTokenSlice | null)?.toJSON() ?? [],
      };
    });
  }
}

export const changeText = (
  document: DocumentIndex,
  path: readonly number[],
  from: number,
  to: number,
  text: string
) => {
  const start = document.positionAt({ offset: from, path });
  const end = document.positionAt({ offset: to, path });

  return RootChange.create(document, {
    from: start,
    insert: PreparedTokenSlice.text(text),
    to: end,
  });
};

export const insertTextChange = (
  document: DocumentIndex,
  path: readonly number[],
  offset: number,
  text: string
) => changeText(document, path, offset, offset, text);

export const removeTextChange = (
  document: DocumentIndex,
  path: readonly number[],
  offset: number,
  text: string
) => changeText(document, path, offset, offset + text.length, '');

export const insertNodeChange = (
  document: DocumentIndex,
  path: readonly number[],
  node: JsonNode
) => {
  const parentPath = path.slice(0, -1);
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot insert the document root.');

  return RootChange.create(document, {
    from: document.childPosition(parentPath, index),
    insert: PreparedTokenSlice.fromNodes([node]),
  });
};

export const removeNodeChange = (
  document: DocumentIndex,
  path: readonly number[]
) => {
  const range = document.nodeRange(path);

  return RootChange.create(document, range);
};

export const setNodesChange = (
  document: DocumentIndex,
  updates: ReadonlyArray<
    Readonly<{
      newProperties: JsonRecord;
      path: readonly number[];
      properties: JsonRecord;
    }>
  >,
  isSetValued: DocumentSetPropertyResolver = () => false,
  root: string | null = null
) => {
  const changes = updates.flatMap(
    ({ newProperties, path, properties }): RootChangeSection[] => {
      const node = document.node(path);
      const context = getDocumentPropertyContext(document, path, root);
      const next = { ...node } as JsonRecord;

      for (const key of Object.keys(properties)) {
        if (!Object.hasOwn(newProperties, key)) delete next[key];
      }

      for (const [key, value] of Object.entries(newProperties)) {
        if (value === null) {
          delete next[key];
        } else {
          next[key] = value;
        }
      }

      const modifications = semanticPropertyModifications(
        nodeProps(node),
        nodeProps(next as JsonNode),
        (key) => isSetValued(node, key, context)
      );

      if (modifications.length === 0) return [];
      const range = document.nodeRange(path);

      return [
        {
          from: range.from,
          properties: propertyDeltaFromModifications(modifications),
          to: range.from + 1,
        },
      ];
    }
  );

  return RootChange.create(document, changes);
};

export const setNodeChange = (
  document: DocumentIndex,
  path: readonly number[],
  newProperties: JsonRecord,
  properties: JsonRecord = {},
  isSetValued: DocumentSetPropertyResolver = () => false,
  root: string | null = null
) =>
  setNodesChange(
    document,
    [{ newProperties, path, properties }],
    isSetValued,
    root
  );

/**
 * Build a path-targeted property section for transform adapters.
 *
 * @internal
 */
export const updateNodePropertiesChange = (
  document: DocumentIndex,
  path: readonly number[],
  properties: NodePropertyDelta
) => {
  const range = document.nodeRange(path);

  return RootChange.create(document, {
    from: range.from,
    properties,
    to: range.from + 1,
  });
};

type SiblingRunMove = Readonly<{
  count: number;
  from: number;
  fromAfterMove: number;
  insertAt: number;
  path: readonly number[];
  targetPath: readonly number[];
  to: number;
}>;

const siblingRunMove = (
  document: DocumentIndex,
  replacements: readonly Replacement[]
): SiblingRunMove | null => {
  if (replacements.length !== 2) return null;

  const deletion = replacements.find(
    (replacement) =>
      replacement.from < replacement.to && replacement.insert.length === 0
  );
  const insertion = replacements.find(
    (replacement) =>
      replacement.from === replacement.to && replacement.insert.length > 0
  );

  if (!deletion || !insertion) return null;

  const source = document.nodeStartingAt(deletion.from);
  const target = document.childBoundaryAt(insertion.from);

  if (
    !source ||
    !target ||
    insertion.insert.length !== deletion.to - deletion.from
  ) {
    return null;
  }

  const sourceParent = source.path.slice(0, -1);
  const sourceNodes: JsonNode[] = [];

  for (let at = deletion.from; at < deletion.to;) {
    const node = document.nodeStartingAt(at);

    if (
      !node ||
      node.to > deletion.to ||
      pathKey(node.path.slice(0, -1)) !== pathKey(sourceParent)
    ) {
      return null;
    }
    sourceNodes.push(document.node(node.path));
    at = node.to;
  }

  let insertedNodes: readonly JsonNode[];

  try {
    insertedNodes = decodeNodes(insertion.insert).nodes;
  } catch {
    return null;
  }

  if (!jsonEqual(insertedNodes, sourceNodes)) return null;

  const sourceIndex = getDefined(source.path.at(-1));
  const sameParent = pathKey(sourceParent) === pathKey(target.parentPath);
  const targetIndex =
    sameParent && sourceIndex < target.index
      ? target.index - sourceNodes.length
      : target.index;

  return {
    count: sourceNodes.length,
    from: source.from,
    fromAfterMove:
      insertion.from >= deletion.to
        ? insertion.from - (deletion.to - deletion.from)
        : insertion.from,
    insertAt: insertion.from,
    path: source.path,
    to: deletion.to,
    targetPath: [...target.parentPath, targetIndex],
  };
};

const typingMovedToJoinStart = (
  join: Replacement,
  typed: readonly Replacement[]
) =>
  typed.every((other) => other.from === join.to && other.to === join.to)
    ? typed.map((other) => ({ ...other, from: join.from, to: join.from }))
    : null;

const meets = (
  range: Readonly<{ from: number; to: number }>,
  other: Readonly<{ from: number; to: number }>
) =>
  other.from === other.to
    ? range.from < other.from && other.from < range.to
    : other.from < range.to && range.from < other.to;

const deletesAcrossLandingOnly = (
  outside: RootChange,
  move: SiblingRunMove
) => {
  let touchesNode = false;
  let spansLanding = false;

  outside.iterChangedRanges((from, to) => {
    if (to > move.from && from < move.to) touchesNode = true;
    if (from < move.insertAt && move.insertAt < to) spansLanding = true;
  });

  return spansLanding && !touchesNode;
};

const LINE_CLOSE_TOKENS = 2;
const LINE_BREAK_TOKENS = 2 * LINE_CLOSE_TOKENS;

const emptyLineRemovalFor = (
  document: DocumentIndex,
  replacement: Replacement
): Replacement | null => {
  if (
    replacement.insert.length > 0 ||
    replacement.to - replacement.from !== LINE_BREAK_TOKENS
  ) {
    return null;
  }

  const line = document.nodeStartingAt(replacement.from + LINE_CLOSE_TOKENS);

  if (!line || line.to !== replacement.to + LINE_CLOSE_TOKENS) return null;

  const index = getDefined(line.path.at(-1));
  const node = document.node(line.path);

  if (index === 0 || !isElementNode(node) || node.children.length !== 1) {
    return null;
  }

  const [text] = node.children;

  if (!text || !isTextNode(text) || text.text !== '') return null;

  const previousPath = [...line.path.slice(0, -1), index - 1];
  const previous = document.node(previousPath);

  if (!isElementNode(previous)) return null;

  const lastIndex = previous.children.length - 1;
  const last = previous.children[lastIndex];

  if (
    !last ||
    !isTextNode(last) ||
    document.nodeRange([...previousPath, lastIndex]).to !== replacement.from + 1
  ) {
    return null;
  }

  return { from: line.from, insert: PreparedTokenSlice.empty, to: line.to };
};

const moveChangeAfterEdit = (
  afterEdit: DocumentIndex,
  move: SiblingRunMove,
  edit: RootChange
) => {
  const end = move.to + edit.newLength - edit.length;

  if (move.count === 1 && afterEdit.nodeStartingAt(move.from)?.to === end) {
    return moveNodeChange(afterEdit, move.path, move.targetPath);
  }

  if (end <= move.from) return null;

  const parent = pathKey(move.path.slice(0, -1));
  let at = move.from;

  while (at < end) {
    const node = afterEdit.nodeStartingAt(at);

    if (!node || node.to > end || pathKey(node.path.slice(0, -1)) !== parent) {
      return null;
    }
    at = node.to;
  }

  return RootChange.create(afterEdit, [
    { from: move.from, to: end },
    {
      from:
        move.insertAt >= move.to
          ? move.insertAt + end - move.to
          : move.insertAt,
      insert: afterEdit.slice(move.from, end),
    },
  ]);
};

export const moveNodeChange = (
  document: DocumentIndex,
  path: readonly number[],
  newPath: readonly number[]
) => {
  if (pathKey(path) === pathKey(newPath)) {
    return RootChange.empty(document.length);
  }

  const range = document.nodeRange(path);
  const sourceParent = path.slice(0, -1);
  const targetParent = newPath.slice(0, -1);
  const sourceIndex = path.at(-1);
  const targetIndex = newPath.at(-1);

  if (sourceIndex === undefined || targetIndex === undefined) {
    throw new Error('Cannot move the document root.');
  }

  const sameParent = pathKey(sourceParent) === pathKey(targetParent);
  const targetParentChildren =
    targetParent.length === 0
      ? document.value
      : (() => {
          const parent = document.node(targetParent);

          if (!isElementNode(parent)) {
            throw new Error(`Node at [${targetParent}] is not an element.`);
          }

          return parent.children;
        })();
  const originTargetIndex =
    sameParent && sourceIndex < targetIndex
      ? Math.min(targetIndex + 1, targetParentChildren.length)
      : targetIndex;
  const target = document.childPosition(targetParent, originTargetIndex);

  if (range.from <= target && target <= range.to) {
    throw new Error('Cannot move a node inside itself.');
  }

  return RootChange.create(document, [
    { from: range.from, to: range.to },
    { from: target, insert: document.nodeSlice(path) },
  ]);
};

export const replaceChildrenChange = (
  document: DocumentIndex,
  path: readonly number[],
  index: number,
  removeCount: number,
  newChildren: readonly JsonNode[]
) => {
  const currentChildren =
    path.length === 0
      ? document.value
      : (() => {
          const parent = document.node(path);

          if (!isElementNode(parent)) {
            throw new Error(`Node at [${path}] is not an element.`);
          }

          return parent.children;
        })();
  const removed = currentChildren.slice(index, index + removeCount);

  if (
    removed.length === newChildren.length &&
    removed.every((node, childIndex) =>
      jsonEqual(node, newChildren[childIndex])
    )
  ) {
    return RootChange.empty(document.length);
  }

  return RootChange.create(document, {
    from: document.childPosition(path, index),
    insert: PreparedTokenSlice.fromNodes(newChildren),
    to: document.childPosition(path, index + removed.length),
  });
};

export const replaceChildRunsChange = (
  document: DocumentIndex,
  runs: readonly ChildRun[]
) =>
  RootChange.create(
    document,
    runs.map(({ children, index, path, removeCount }) => ({
      from: document.childPosition(path, index),
      insert: PreparedTokenSlice.fromNodes(children),
      to: document.childPosition(path, index + removeCount),
    }))
  );

export type ChildRun = Readonly<{
  children: readonly JsonNode[];
  index: number;
  path: readonly number[];
  removeCount: number;
}>;

/**
 * Build one canonical child reconciliation without applying it.
 *
 * @internal
 */
export const reconcileChildrenStep = (
  document: DocumentIndex,
  path: readonly number[],
  index: number,
  removeCount: number,
  newChildren: readonly JsonNode[]
) => {
  const currentChildren =
    path.length === 0
      ? document.value
      : (() => {
          const parent = document.node(path);

          if (!isElementNode(parent)) {
            throw new Error(`Node at [${path}] is not an element.`);
          }

          return parent.children;
        })();
  const removed = currentChildren.slice(index, index + removeCount);

  if (
    removed.length === newChildren.length &&
    removed.every((node, childIndex) =>
      jsonEqual(node, newChildren[childIndex])
    )
  ) {
    return Object.freeze({
      after: document,
      change: RootChange.empty(document.length),
    });
  }

  const after = document.withSplicedNodes(
    path,
    index,
    removed.length,
    newChildren
  );

  if (removed.length === 0 || newChildren.length === 0) {
    return Object.freeze({
      after,
      change: RootChange.create(document, {
        from: document.childPosition(path, index),
        insert: PreparedTokenSlice.fromNodes(newChildren),
        to: document.childPosition(path, index + removed.length),
      }),
    });
  }

  const beforeWindow = DocumentIndex.fromValue(removed);
  const afterWindow = DocumentIndex.fromValue(newChildren);
  const localChange = RootChange.between(beforeWindow, afterWindow);
  const offset = document.childPosition(path, index);

  return Object.freeze({
    after,
    change: localChange.embed(document.length, offset),
  });
};

export const mergeNodeChange = (
  document: DocumentIndex,
  path: readonly number[]
) => {
  const index = path.at(-1);

  if (index === undefined || index === 0) {
    throw new Error(`Cannot merge node at [${path}].`);
  }

  const previousPath = [...path.slice(0, -1), index - 1];
  const previous = document.node(previousPath);
  const node = document.node(path);

  if (
    !(
      (isTextNode(previous) && isTextNode(node)) ||
      (isElementNode(previous) && isElementNode(node))
    )
  ) {
    throw new Error(`Cannot merge nodes of different kinds at [${path}].`);
  }

  const boundary = document.nodeRange(path).from;

  // A merge removes only the previous close token and current open token.
  // Encoding that primitive directly preserves the join position for points
  // on either side; a generic tree diff loses that semantic boundary.
  return RootChange.create(document, {
    from: boundary - 1,
    to: boundary + 1,
  });
};

export const splitNodeChange = (
  document: DocumentIndex,
  path: readonly number[],
  position: number,
  properties: JsonRecord
) => {
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot split the document root.');

  const node = document.node(path);
  let after: JsonNode;

  if (isTextNode(node)) {
    if (position < 0 || position > node.text.length) {
      throw new Error(`Cannot split text at offset ${position}.`);
    }

    after = { ...properties, text: '' };
  } else {
    if (position < 0 || position > node.children.length) {
      throw new Error(`Cannot split element at child index ${position}.`);
    }

    after = {
      ...(typeof properties.type === 'string'
        ? { type: properties.type }
        : typeof node.type === 'string'
          ? { type: node.type }
          : {}),
      ...properties,
      children: [],
    };
  }

  const nodeKind = isTextNode(node) ? 'text' : 'element';
  const boundary = isTextNode(node)
    ? document.positionAt({ path, offset: position })
    : document.childPosition(path, position);

  // The split boundary preserves points on both sides and the left node's key.
  // A whole-document diff can reinterpret that boundary as sibling insertion.
  return RootChange.create(document, {
    from: boundary,
    insert: PreparedTokenSlice.fromTokens([
      closeToken(nodeKind),
      openToken(nodeKind, nodeProps(after)),
    ]),
  });
};
