import type { AuthoredMark } from '../authored';
import type {
  Descendant,
  EditorDocumentValue,
  EditorJsonValue,
  Element,
  Text,
} from '../facade';
import { ElementApi } from '../facade';

type LegacySuggestionData = Readonly<{
  createdAt: number;
  id: string;
  isLineBreak?: boolean;
  newProperties?: Readonly<Record<string, EditorJsonValue>>;
  properties?: Readonly<Record<string, EditorJsonValue>>;
  type: 'insert' | 'remove' | 'update';
  userId: string;
}>;

export type PlateV54LegacySuggestionMigration = Readonly<{
  /** Pending changes the review document holds, one per legacy suggestion. */
  changes: number;
  /** The document with each legacy suggestion as review marks. */
  review: EditorDocumentValue;
}>;

type MutableSuggestionRecord = {
  authorId: string;
  createdAt: number;
  firstLocation: string;
  id: string;
  kinds: Set<LegacySuggestionData['type']>;
};

const LEGACY_SUGGESTION_PREFIX = 'suggestion_';
const LEGACY_TRANSIENT_KEYS = new Set([
  'suggestionData',
  'suggestionTransient',
]);
const COMMON_DATA_KEYS = new Set(['createdAt', 'id', 'type', 'userId']);
const INSERT_REMOVE_DATA_KEYS = new Set([...COMMON_DATA_KEYS, 'isLineBreak']);
const UPDATE_DATA_KEYS = new Set([
  ...COMMON_DATA_KEYS,
  'newProperties',
  'properties',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isJsonValue = (value: unknown): value is EditorJsonValue => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (!isRecord(value)) return false;

  return Object.values(value).every(isJsonValue);
};

const isJsonRecord = (
  value: unknown
): value is Readonly<Record<string, EditorJsonValue>> =>
  isRecord(value) && Object.values(value).every(isJsonValue);

const jsonEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]))
    );
  }
  if (!isRecord(left) || !isRecord(right)) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key])
    )
  );
};

const assertPropertySet = (value: unknown, location: string) => {
  if (value !== undefined && !isJsonRecord(value)) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion at ${location}: property snapshots must be JSON objects.`
    );
  }
  if (
    value &&
    [
      'children',
      'suggestion',
      'suggestionData',
      'suggestionTransient',
      'text',
    ].some((key) => Object.hasOwn(value, key))
  ) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion at ${location}: property snapshots contain reserved document fields.`
    );
  }
};

const parseSuggestionData = (
  value: unknown,
  location: string,
  keyedId?: string
): LegacySuggestionData => {
  if (!isRecord(value)) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion at ${location}: metadata must be an object.`
    );
  }
  const { createdAt, id, type, userId } = value;

  if (typeof id !== 'string' || id.length === 0 || id !== (keyedId ?? id)) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion at ${location}: identity does not match its property key.`
    );
  }
  if (
    !Number.isSafeInteger(createdAt) ||
    (createdAt as number) < 0 ||
    typeof userId !== 'string' ||
    userId.length === 0
  ) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion "${id}" at ${location}: author or creation time is invalid.`
    );
  }
  if (type !== 'insert' && type !== 'remove' && type !== 'update') {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion "${id}" at ${location}: type is invalid.`
    );
  }
  const allowed =
    type === 'update' ? UPDATE_DATA_KEYS : INSERT_REMOVE_DATA_KEYS;
  const unsupported = Object.keys(value).find((key) => !allowed.has(key));

  if (unsupported) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion "${id}" at ${location}: property "${unsupported}" has no native meaning.`
    );
  }
  if (type === 'update') {
    assertPropertySet(value.properties, `${location}.properties`);
    assertPropertySet(value.newProperties, `${location}.newProperties`);
    if (
      Object.keys(value.properties ?? {}).length === 0 &&
      Object.keys(value.newProperties ?? {}).length === 0
    ) {
      throw new Error(
        `Plate v54 migration cannot convert empty legacy update "${id}" at ${location}.`
      );
    }
  } else if (
    value.isLineBreak !== undefined &&
    typeof value.isLineBreak !== 'boolean'
  ) {
    throw new Error(
      `Plate v54 migration cannot convert legacy suggestion "${id}" at ${location}: isLineBreak must be a boolean.`
    );
  }

  return value as LegacySuggestionData;
};

const legacyKeys = (node: Descendant) =>
  Object.keys(node).filter((key) => key.startsWith(LEGACY_SUGGESTION_PREFIX));

const hasLegacyMetadata = (node: Descendant) =>
  Object.hasOwn(node, 'suggestion') ||
  Object.hasOwn(node, 'suggestionData') ||
  Object.hasOwn(node, 'suggestionTransient') ||
  legacyKeys(node).length > 0;

const stripLegacyMetadata = (node: Descendant): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(node).filter(
      ([key]) =>
        key !== 'suggestion' &&
        !LEGACY_TRANSIENT_KEYS.has(key) &&
        !key.startsWith(LEGACY_SUGGESTION_PREFIX)
    )
  );

const validateProposedProperties = (
  node: Descendant,
  data: LegacySuggestionData,
  location: string
) => {
  if (data.type !== 'update') return;
  const proposed = data.newProperties ?? {};
  const previous = data.properties ?? {};

  for (const key of new Set([
    ...Object.keys(previous),
    ...Object.keys(proposed),
  ])) {
    const hasExpected = Object.hasOwn(proposed, key);
    const hasActual = Object.hasOwn(node, key);

    if (
      hasExpected !== hasActual ||
      (hasExpected && !jsonEqual(Reflect.get(node, key), proposed[key]))
    ) {
      throw new Error(
        `Plate v54 migration cannot convert legacy update "${data.id}" at ${location}: current property "${key}" does not match newProperties.`
      );
    }
  }
};

/** Decode the frozen Plate v53 Suggestion metadata into review marks. */
export const migratePlateV54Suggestions = (
  document: EditorDocumentValue
): PlateV54LegacySuggestionMigration | null => {
  const annotations = new WeakMap<object, LegacySuggestionData>();
  const records = new Map<string, MutableSuggestionRecord>();
  let foundLegacyMetadata = false;

  const record = (data: LegacySuggestionData, location: string) => {
    const current = records.get(data.id);

    if (!current) {
      records.set(data.id, {
        authorId: data.userId,
        createdAt: data.createdAt,
        firstLocation: location,
        id: data.id,
        kinds: new Set([data.type]),
      });
      return;
    }
    if (
      current.authorId !== data.userId ||
      current.createdAt !== data.createdAt
    ) {
      throw new Error(
        `Plate v54 migration cannot convert legacy suggestion "${data.id}": its author or creation time is inconsistent.`
      );
    }
    current.kinds.add(data.type);
    if (current.kinds.has('update') && current.kinds.size > 1) {
      throw new Error(
        `Plate v54 migration cannot convert legacy suggestion "${data.id}": updates cannot share an identity with inserted or removed content.`
      );
    }
  };

  const inspectNode = (node: Descendant, location: string): Set<string> => {
    const keys = legacyKeys(node);
    const marker = Reflect.get(node, 'suggestion');
    const locallyLegacy = hasLegacyMetadata(node);

    if (locallyLegacy) foundLegacyMetadata = true;
    const data: LegacySuggestionData[] = [];

    if (isRecord(marker)) {
      if (keys.length > 0) {
        throw new Error(
          `Plate v54 migration cannot convert overlapping block and inline suggestions at ${location}.`
        );
      }
      data.push(parseSuggestionData(marker, `${location}.suggestion`));
    } else if (keys.length > 0) {
      if (marker !== true) {
        throw new Error(
          `Plate v54 migration cannot convert legacy suggestion data at ${location} without suggestion: true.`
        );
      }
      data.push(
        ...keys.map((key) =>
          parseSuggestionData(
            Reflect.get(node, key),
            `${location}.${key}`,
            key.slice(LEGACY_SUGGESTION_PREFIX.length)
          )
        )
      );
    } else if (marker === true) {
      throw new Error(
        `Plate v54 migration cannot convert legacy suggestion marker at ${location} without identity data.`
      );
    } else if (marker !== undefined && marker !== false && locallyLegacy) {
      throw new Error(
        `Plate v54 migration cannot convert legacy suggestion metadata at ${location}.`
      );
    }

    if (data.length > 1) {
      throw new Error(
        `Plate v54 migration cannot convert ambiguous overlapping suggestion identities at ${location}.`
      );
    }
    const own = data[0];

    if (own) {
      if (own.isLineBreak && !ElementApi.isElement(node)) {
        throw new Error(
          `Plate v54 migration cannot convert line-break suggestion "${own.id}" on non-element ${location}.`
        );
      }
      validateProposedProperties(node, own, location);
      annotations.set(node, own);
      record(own, location);
    }

    const descendants = new Set<string>();

    if (ElementApi.isElement(node)) {
      node.children.forEach((child, index) => {
        inspectNode(child, `${location}.children.${index}`).forEach((id) =>
          descendants.add(id)
        );
      });
    }
    if (own && [...descendants].some((id) => id !== own.id)) {
      throw new Error(
        `Plate v54 migration cannot convert overlapping suggestions at ${location}: "${own.id}" contains another suggestion identity.`
      );
    }
    if (own) descendants.add(own.id);

    return descendants;
  };

  const inspectChildren = (
    children: readonly Descendant[],
    location: string
  ) => {
    const subtreeIds = children.map((node, index) =>
      inspectNode(node, `${location}.${index}`)
    );

    children.forEach((node, index) => {
      const data = annotations.get(node);

      if (!data?.isLineBreak) return;
      const next = children[index + 1];

      if (!next || !ElementApi.isElement(next)) {
        throw new Error(
          `Plate v54 migration cannot convert line-break suggestion "${data.id}" at ${location}.${index}: the following sibling must be an element.`
        );
      }
      const nextIds = subtreeIds[index + 1];

      if (nextIds && [...nextIds].some((id) => id !== data.id)) {
        throw new Error(
          `Plate v54 migration cannot convert line-break suggestion "${data.id}" at ${location}.${index}: the following sibling belongs to another suggestion.`
        );
      }
    });
  };

  inspectChildren(document.children, 'main');
  Object.entries(document.roots ?? {}).forEach(([root, children]) =>
    inspectChildren(children, `roots.${root}`)
  );

  if (!foundLegacyMetadata) return null;
  if (records.size > 0 && document.meta?.authored !== undefined) {
    throw new Error(
      'Plate v54 migration cannot combine legacy suggestions with existing native authored metadata.'
    );
  }

  const markOf = (data: LegacySuggestionData): AuthoredMark => {
    const base = { at: data.createdAt, author: data.userId, change: data.id };

    if (data.type === 'insert') {
      return { ...base, kind: data.isLineBreak ? 'split' : 'insert' };
    }

    return { ...base, kind: data.isLineBreak ? 'join' : 'delete' };
  };
  // Inserted and removed content marks everything inside it, as recording
  // does; property updates mark only their own node.
  const reviewNode = (
    node: Descendant,
    inherited: readonly AuthoredMark[]
  ): Record<string, unknown> => {
    const data = annotations.get(node);
    const result = stripLegacyMetadata(node);
    const marks = [...inherited];
    let carried = inherited;

    if (data && !data.isLineBreak && data.type !== 'update') {
      const mark = markOf(data);

      if (!marks.some((own) => own.change === mark.change)) marks.push(mark);
      carried = marks;
    }
    if (data?.type === 'update') {
      const before = data.properties ?? {};
      const after = data.newProperties ?? {};
      const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

      for (const key of [...keys].toSorted()) {
        const value = after[key];

        marks.push({
          at: data.createdAt,
          author: data.userId,
          ...(Object.hasOwn(before, key) ? { before: before[key] } : {}),
          change: data.id,
          id: `${data.id}:${key}`,
          key,
          kind: 'format',
          write:
            value === undefined || value === null
              ? { kind: 'remove' }
              : { kind: 'set', value },
        });
      }
    }
    if (ElementApi.isElement(node)) {
      result.children = reviewChildren(node.children, carried);
    }

    return marks.length > 0 ? { ...result, authored: marks } : result;
  };
  // A legacy line break belongs to the boundary after its block, which the
  // next block carries: a split it would undo or a join it would make.
  const reviewChildren = (
    children: readonly Descendant[],
    inherited: readonly AuthoredMark[] = []
  ) => {
    const reviewed = children.map((node) => reviewNode(node, inherited));

    children.forEach((node, index) => {
      const data = annotations.get(node);
      const next = reviewed[index + 1];

      if (!data?.isLineBreak || !next) return;
      next.authored = [
        ...((next.authored as AuthoredMark[] | undefined) ?? []),
        markOf(data),
      ];
    });

    return reviewed as unknown as Descendant[];
  };

  return Object.freeze({
    changes: records.size,
    review: {
      ...document,
      children: reviewChildren(document.children),
      ...(document.roots
        ? {
            roots: Object.fromEntries(
              Object.entries(document.roots).map(([root, children]) => [
                root,
                reviewChildren(children),
              ])
            ),
          }
        : {}),
    } as EditorDocumentValue,
  });
};

const reviewMarks = (node: Descendant) =>
  (Reflect.get(node, 'authored') as readonly AuthoredMark[] | undefined) ?? [];
const changesContent = (mark: AuthoredMark) => mark.kind !== 'format';
const covers = (mark: AuthoredMark) =>
  mark.kind === 'insert' || mark.kind === 'delete';
const markedText = (text: string, marks: readonly AuthoredMark[]): Text =>
  marks.length > 0 ? { authored: marks, text } : { text };

/**
 * The merged text keeps none of the replaced nodes' properties, so it drops
 * their format suggestions with them.
 */
export const migratePlateV54ReplacementText = (
  nodes: readonly Descendant[],
  text: string,
  location: string
): Text => {
  let shared: readonly AuthoredMark[] | undefined;
  const visit = (node: Descendant) => {
    const marks = reviewMarks(node).filter(changesContent);

    shared ??= marks;
    if (
      marks.length !== shared.length ||
      marks.some(
        (mark) => !covers(mark) || !shared?.some((own) => jsonEqual(own, mark))
      )
    ) {
      throw new Error(
        `Plate v54 migration cannot merge the texts at ${location} into one source text without losing their review marks.`
      );
    }
    if (ElementApi.isElement(node)) node.children.forEach(visit);
  };

  nodes.forEach(visit);

  return markedText(text, shared ?? []);
};

export const migratePlateV54DrawingCodeText = (
  drawing: Element,
  code: string
): Text => markedText(code, reviewMarks(drawing).filter(covers));
