import type { NodeKey } from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import { profileCoreDuration } from '../profiling';
import { assertEditorJsonValue } from '../value-codec';
import {
  type ChangedOutputRange,
  decodeNodes,
  DocumentIndex,
} from './document-index';
import {
  claimPreparedNodeSlice,
  closeToken,
  cloneFrozen,
  cloneJson,
  commonPrefixLength,
  commonSuffixLength,
  DOCUMENT_SLICE_PREPARED_NODES,
  PreparedTokenSlice,
  isElementNode,
  isRecord,
  isTextNode,
  jsonEqual,
  type JsonNode,
  type JsonRecord,
  type JsonToken,
  type JsonTokenData,
  nodeProps,
  openToken,
  pathKey,
} from './tokens';
import {
  assertNodePropertyKey,
  clonePropertyModification,
  normalizeSetValues,
  type PropertyDeltaJson,
  type PropertyModification,
  type PropertyModificationJson,
  transformEarlierPropertyModifications,
  transformPathAfterRemove,
  unsafeNodePropertyKeys,
} from './transform';

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

  get slice() {
    return (this.data[(this.index - 2) >> 1] ??
      PreparedTokenSlice.empty) as PreparedTokenSlice;
  }

  get modifications() {
    return this.inserted === -2
      ? (this.data[(this.index - 2) >> 1] as readonly PropertyModification[])
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

export const addSection = (
  sections: number[],
  data: SectionData[],
  length: number,
  inserted: number,
  value: SectionData,
  forceJoin = false
) => {
  if (length === 0 && inserted <= 0) return;

  const last = sections.length - 2;

  if (last >= 0 && inserted === -1 && sections[last + 1] === -1) {
    sections[last] += length;
    return;
  }

  if (
    inserted >= 0 &&
    (forceJoin || (last >= 0 && length === 0 && sections[last] === 0))
  ) {
    sections[last] += length;
    sections[last + 1] += inserted;
    data[data.length - 1] = (
      (data.at(-1) ?? PreparedTokenSlice.empty) as PreparedTokenSlice
    ).concat((value ?? PreparedTokenSlice.empty) as PreparedTokenSlice);
    return;
  }

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
  const a = new SectionIterator(sectionsA, dataA);
  const b = new SectionIterator(sectionsB, dataB);
  let open = false;

  for (;;) {
    if (a.done && b.done) return { data, sections };

    if (a.inserted === 0) {
      addSection(sections, data, a.length, 0, a.slice, open);
      a.next();
      continue;
    }

    if (b.length === 0 && !b.done) {
      addSection(sections, data, 0, b.inserted, b.slice, open);
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

      addSection(
        sections,
        data,
        length,
        modifications.length > 0 ? -2 : -1,
        modifications.length > 0 ? modifications : null,
        open
      );
    } else if (a.keep) {
      addSection(
        sections,
        data,
        length,
        b.offset > 0 ? 0 : b.inserted,
        b.offset > 0 ? PreparedTokenSlice.empty : b.slice,
        open
      );
    } else if (b.keep) {
      const slice = a.slicePart(length);

      addSection(
        sections,
        data,
        a.offset > 0 ? 0 : a.length,
        length,
        b.modifications
          ? applyPropertyModificationsToSlice(slice, b.modifications)
          : slice,
        open
      );
    } else {
      addSection(
        sections,
        data,
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

export const transformChange = (
  changeA: RootChange,
  changeB: RootChange,
  before: boolean
) => {
  if (changeA.length !== changeB.length) {
    throw new Error('Cannot transform mismatched change-set lengths.');
  }

  const sections: number[] = [];
  const data: SectionData[] = [];
  const a = new SectionIterator(changeA.sections, changeA.data);
  const b = new SectionIterator(changeB.sections, changeB.data);
  let inserted = -1;
  let position = 0;

  for (;;) {
    if (a.keep && b.keep) {
      const length = Math.min(a.length, b.length);
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
          (b.length < a.length || (b.length === a.length && !before))))
    ) {
      const end = position + b.length;

      addSection(sections, data, b.inserted, -1, null);

      while (position < end) {
        if (a.done) throw new Error('Mismatched transformed change sets.');

        const piece = Math.min(a.length, end - position);

        if (a.inserted >= 0 && inserted < a.index && a.length <= piece) {
          addSection(sections, data, 0, a.inserted, a.slice);
          inserted = a.index;
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
    isSetValued?: DocumentSetPropertyResolver;
    root?: string | null;
  }>
) => {
  const changes: RootChangeSection[] = [];
  const boundaries = new WeakMap<JsonNode, NodeTextBoundary>();
  const properties = new WeakMap<JsonNode, Readonly<JsonRecord>>();
  let displaced = false;

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
    const modifications = semanticPropertyModifications(
      sourceProperties,
      targetProperties,
      (key) => options.isSetValued?.(source, key, context) ?? false
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
      displaced = true;
    }

    if (
      sourceCount > 0 &&
      targetCount > 0 &&
      sourceCount !== targetCount &&
      (sourceCount === 1 || targetCount === 1)
    ) {
      const sourceRun = source.slice(prefix, sourceEnd);
      const targetRun = target.slice(prefix, targetEnd);

      if (
        sourceRun.every(isTextNode) &&
        targetRun.every(isTextNode) &&
        sourceRun.map((node) => node.text).join('') ===
          targetRun.map((node) => node.text).join('')
      ) {
        // Retain the characters: replacing the run would remap interior selections.
        addPropertyChanges(sourceRun[0], targetRun[0], [...parentPath, prefix]);

        if (targetCount === 1) {
          for (let index = prefix + 1; index < sourceEnd; index++) {
            const boundary = before.childPosition(parentPath, index);
            changes.push({ from: boundary - 1, to: boundary + 1 });
          }
        } else {
          let offset = targetRun[0].text.length;

          for (let index = 1; index < targetRun.length; index++) {
            changes.push({
              from: before.positionAt({
                path: [...parentPath, prefix],
                offset,
              }),
              insert: PreparedTokenSlice.fromTokens([
                closeToken('text'),
                openToken('text', getProperties(targetRun[index])),
              ]),
            });
            offset += targetRun[index].text.length;
          }
        }

        displaced = true;
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
        displaced = true;
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

  return diffChildren(before.value, after.value, []) && displaced
    ? changes
    : null;
};

const sameNodeStructure = (left: JsonNode, right: JsonNode): boolean => {
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

const sameDocumentStructure = (
  left: readonly JsonNode[],
  right: readonly JsonNode[]
): boolean =>
  left.length === right.length &&
  left.every((node, index) => sameNodeStructure(node, right[index]));

const mergeStructuralChangeAtStableSiblingRange = (
  before: DocumentIndex,
  afterStructural: DocumentIndex,
  afterConcurrent: DocumentIndex
): DocumentIndex | null => {
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

  return DocumentIndex.fromValue(merged);
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

  const afterNodes = collectDocumentNodes(afterStructural.value);
  const candidates = collectDocumentNodes(before.value)
    .filter(({ path }) => {
      const range = before.nodeRange(path);

      return changedRanges.every(
        ([from, to]) => range.from <= from && to <= range.to
      );
    })
    .sort((left, right) => right.path.length - left.path.length);

  for (const candidate of candidates) {
    const targets = afterNodes.filter(({ node }) =>
      jsonEqual(node, candidate.node)
    );

    if (targets.length !== 1) continue;

    let edited: JsonNode;

    try {
      edited = afterNested.node(candidate.path);
    } catch {
      continue;
    }
    if (jsonEqual(edited, candidate.node)) continue;

    const targetPath = targets[0].path;
    const targetIndex = targetPath.at(-1);

    if (targetIndex === undefined) continue;

    return afterStructural.withSplicedNodes(
      targetPath.slice(0, -1),
      targetIndex,
      1,
      [edited]
    );
  }

  return null;
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
    this.sections = Object.freeze([...sections]);
    this.data = Object.freeze([...data]);
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
        const modifications = semanticPropertyModifications(
          token.props,
          next.props,
          (key) => options.isSetValued?.(node, key, context) ?? false
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
    return new RootChange(sections, data);
  }

  static transform(a: RootChange, b: RootChange) {
    return {
      a: transformChange(a, b, true),
      b: transformChange(b, a, false),
    };
  }

  static transformInDocument(
    a: RootChange,
    b: RootChange,
    document: DocumentIndex
  ) {
    const aReplacements = a.replacements();
    const bReplacements = b.replacements();
    const aPropertyChanges = a.propertyChanges();
    const bPropertyChanges = b.propertyChanges();
    const [aReplacement] = aReplacements;
    const [bReplacement] = bReplacements;
    const hasSingleReplacement =
      aReplacements.length === 1 && bReplacements.length === 1;
    const isNodeDeletion = (replacement: Replacement | undefined): boolean => {
      if (!replacement || replacement.insert.length > 0) return false;

      return document.nodeStartingAt(replacement.from)?.to === replacement.to;
    };
    const contains = (
      outer: Replacement | undefined,
      inner: Replacement | undefined
    ) =>
      !!outer &&
      !!inner &&
      (inner.from === inner.to
        ? outer.from < inner.from && inner.to < outer.to
        : outer.from <= inner.from && inner.to <= outer.to);
    const getMove = (replacements: readonly Replacement[]) => {
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

      let insertedNodes: readonly JsonNode[];

      try {
        insertedNodes = decodeNodes(insertion.insert).nodes;
      } catch {
        return null;
      }

      const sourceNode = document.node(source.path);

      if (
        insertedNodes.length !== 1 ||
        !jsonEqual(insertedNodes[0], sourceNode)
      ) {
        return null;
      }

      const sourceParent = source.path.slice(0, -1);
      const sourceIndex = getDefined(source.path.at(-1));
      const sameParent = pathKey(sourceParent) === pathKey(target.parentPath);
      const targetIndex =
        sameParent && sourceIndex < target.index
          ? target.index - 1
          : target.index;

      return {
        from: source.from,
        path: source.path,
        to: source.to,
        targetPath: [...target.parentPath, targetIndex],
      };
    };
    const aMove = getMove(aReplacements);
    const bMove = getMove(bReplacements);
    const createMappedPropertyChange = (
      source: readonly PropertyChange[],
      move: NonNullable<ReturnType<typeof getMove>>,
      afterMove: DocumentIndex
    ) => {
      const mapped = source.map((propertyChange) => {
        const entry = document.nodeStartingAt(propertyChange.from);

        if (
          !entry ||
          entry.path.length < move.path.length ||
          !move.path.every((part, index) => entry.path[index] === part)
        ) {
          return null;
        }

        const path = [
          ...move.targetPath,
          ...entry.path.slice(move.path.length),
        ];

        return {
          from: afterMove.nodeRange(path).from,
          modifications: propertyChange.modifications,
        };
      });

      if (mapped.some((change) => change === null)) return null;

      const sections: number[] = [];
      const data: SectionData[] = [];
      let position = 0;

      for (const change of (
        mapped as Array<{
          from: number;
          modifications: readonly PropertyModification[];
        }>
      ).sort((left, right) => left.from - right.from)) {
        if (change.from > position) {
          addSection(sections, data, change.from - position, -1, null);
        }
        addSection(sections, data, 1, -2, change.modifications);
        position = change.from + 1;
      }

      if (position < afterMove.length) {
        addSection(sections, data, afterMove.length - position, -1, null);
      }

      return RootChange.fromSections(sections, data);
    };

    if (
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

    if (bMove && aReplacements.length === 0 && aPropertyChanges.length > 0) {
      const afterA = a.apply(document);
      const afterB = b.apply(document);
      const mapped = createMappedPropertyChange(
        aPropertyChanges,
        bMove,
        afterB
      );

      if (mapped) {
        return {
          a: mapped,
          b: moveNodeChange(afterA, bMove.path, bMove.targetPath),
        };
      }
    }

    if (aMove && bReplacements.length === 0 && bPropertyChanges.length > 0) {
      const afterA = a.apply(document);
      const afterB = b.apply(document);
      const mapped = createMappedPropertyChange(
        bPropertyChanges,
        aMove,
        afterA
      );

      if (mapped) {
        return {
          a: moveNodeChange(afterB, aMove.path, aMove.targetPath),
          b: mapped,
        };
      }
    }

    const transformed = RootChange.transform(a, b);
    const afterA = a.apply(document);
    const afterB = b.apply(document);
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

    if (
      (aChangesStructure || bChangesStructure) &&
      sharesStructuralStart &&
      sameDocumentStructure(afterA.value, afterB.value)
    ) {
      return {
        a: RootChange.between(afterB, afterA),
        b: RootChange.empty(afterA.length),
      };
    }

    const bThroughStableA = bChangesStructure
      ? mergeStructuralChangeAtStableSiblingRange(document, afterB, afterA)
      : null;

    if (bThroughStableA !== null) {
      return {
        a: RootChange.between(afterB, bThroughStableA),
        b: RootChange.between(afterA, bThroughStableA),
      };
    }

    const aThroughStableB = aChangesStructure
      ? mergeStructuralChangeAtStableSiblingRange(document, afterA, afterB)
      : null;

    if (aThroughStableB !== null) {
      return {
        a: RootChange.between(afterB, aThroughStableB),
        b: RootChange.between(afterA, aThroughStableB),
      };
    }

    const aThroughB = bChangesStructure
      ? mergeNestedChangeThroughStructuralRelocation(
          a,
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

    try {
      if (
        jsonEqual(
          transformed.b.apply(afterA).value,
          transformed.a.apply(afterB).value
        )
      ) {
        return transformed;
      }
    } catch {
      // Resolve structural conflicts below.
    }

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

    if (
      hasSingleReplacement &&
      isNodeDeletion(bReplacement) &&
      contains(bReplacement, aReplacement)
    ) {
      const deletedPath = getDefined(
        document.nodeStartingAt(bReplacement.from)
      ).path;

      return {
        a: RootChange.empty(afterB.length),
        b: removeNodeChange(afterA, deletedPath),
      };
    }

    if (
      hasSingleReplacement &&
      isNodeDeletion(aReplacement) &&
      contains(aReplacement, bReplacement)
    ) {
      const deletedPath = getDefined(
        document.nodeStartingAt(aReplacement.from)
      ).path;

      return {
        a: removeNodeChange(afterB, deletedPath),
        b: RootChange.empty(afterA.length),
      };
    }

    return {
      a: RootChange.empty(afterB.length),
      b: RootChange.between(afterA, afterB),
    };
  }

  get empty() {
    return (
      this.sections.length === 0 ||
      (this.sections.length === 2 && this.sections[1] === -1)
    );
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

    const replacementsByPosition = [...replacements].sort(
      (left, right) => left.from - right.from
    );

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
    const recordLocality = (path: readonly number[]) => {
      work.ancestorPaths.push([...path]);
      work.localizedReplacements += 1;

      return true;
    };

    for (const replacement of replacementsByPosition.toReversed()) {
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
        nodeEntry
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
            entry.from <= replacement.from &&
            replacement.to <= entry.to &&
            (replacement.from !== replacement.to ||
              (entry.from < replacement.from && replacement.from < entry.to))
        );

      let localized = false;

      for (const ancestor of ancestors) {
        try {
          const ancestorSlice = current.nodeSlice(ancestor.path);
          const replacementFrom = replacement.from - ancestor.from;
          const replacementTo = replacement.to - ancestor.from;
          const local = PreparedTokenSlice.concat([
            ancestorSlice.slice(0, replacementFrom),
            replacement.insert,
            ancestorSlice.slice(replacementTo),
          ]);
          const nodes = profileCoreDuration(
            'change-set-local-decode',
            () => decodeNodes(local).nodes
          );
          const index = getDefined(ancestor.path.at(-1));

          if (!recordLocality(ancestor.path)) return null;
          current = profileCoreDuration('change-set-local-splice', () =>
            current.withDecodedSplicedNodes(
              ancestor.path.slice(0, -1),
              index,
              1,
              nodes
            )
          );
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
    const indexed = profileCoreDuration('change-set-apply-indexed', () =>
      this.applyIndexed(document, replacements, propertyChanges, work)
    );

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

  invert(document: DocumentIndex) {
    if (document.length !== this.length) {
      throw new Error('Cannot invert against a mismatched document.');
    }

    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;

    for (let index = 0; index < this.sections.length; index += 2) {
      const length = this.sections[index];
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
   * Bind existing runtime identities to whole nodes inserted by this change.
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
        }
      }

      outputPosition += outputLength;
    }

    return changed ? new RootChange(this.sections, data) : this;
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
    let positionA = 0;
    let positionB = 0;

    for (let index = 0; index < this.sections.length;) {
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
