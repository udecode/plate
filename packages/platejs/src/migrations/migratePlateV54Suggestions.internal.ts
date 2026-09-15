import type {
  Descendant,
  EditorDocumentValue,
  PropertyJsonValue,
} from '../facade';
import { ElementApi } from '../facade';

type LegacySuggestionData = Readonly<{
  createdAt: number;
  id: string;
  isLineBreak?: boolean;
  newProperties?: Readonly<Record<string, PropertyJsonValue>>;
  properties?: Readonly<Record<string, PropertyJsonValue>>;
  type: 'insert' | 'remove' | 'update';
  userId: string;
}>;

export type PlateV54LegacySuggestionRevision = Readonly<{
  authorId: string;
  createdAt: number;
  id: string;
  proposed: EditorDocumentValue;
}>;

export type PlateV54LegacySuggestionMigration = Readonly<{
  accepted: EditorDocumentValue;
  revisions: readonly PlateV54LegacySuggestionRevision[];
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

const isJsonValue = (value: unknown): value is PropertyJsonValue => {
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
): value is Readonly<Record<string, PropertyJsonValue>> =>
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

/** Decode the frozen Plate v53 Suggestion metadata into native authored revisions. */
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

  const transformNode = (
    node: Descendant,
    applied: ReadonlySet<string>
  ): Descendant | null => {
    const data = annotations.get(node);
    const isApplied = data ? applied.has(data.id) : false;

    if (
      data &&
      !data.isLineBreak &&
      ((data.type === 'insert' && !isApplied) ||
        (data.type === 'remove' && isApplied))
    ) {
      return null;
    }
    const result = stripLegacyMetadata(node);

    if (ElementApi.isElement(node)) {
      const children = transformChildren(node.children, applied);

      result.children =
        children.length === 0 && node.children.length > 0
          ? [{ text: '' }]
          : children;
    }
    if (data?.type === 'update' && !isApplied) {
      for (const key of Object.keys(data.newProperties ?? {})) {
        if (!Object.hasOwn(data.properties ?? {}, key)) delete result[key];
      }
      Object.assign(result, data.properties ?? {});
    }

    return result as Descendant;
  };

  const transformChildren = <T extends readonly Descendant[]>(
    children: T,
    applied: ReadonlySet<string>
  ): T => {
    const transformed = children.map((node) => transformNode(node, applied));

    for (let index = children.length - 2; index >= 0; index--) {
      const child = children[index];

      if (!child) continue;
      const data = annotations.get(child);
      const merge =
        data?.isLineBreak === true &&
        ((data.type === 'insert' && !applied.has(data.id)) ||
          (data.type === 'remove' && applied.has(data.id)));

      if (!merge) continue;
      const before = transformed[index];
      const after = transformed[index + 1];

      if (
        !before ||
        !after ||
        !ElementApi.isElement(before) ||
        !ElementApi.isElement(after)
      ) {
        throw new Error(
          `Plate v54 migration cannot materialize line-break suggestion "${data.id}".`
        );
      }
      transformed[index] = {
        ...before,
        children: [...before.children, ...after.children],
      };
      transformed[index + 1] = null;
    }

    return transformed.filter(
      (node): node is Descendant => node !== null
    ) as unknown as T;
  };

  const documentFor = (applied: ReadonlySet<string>): EditorDocumentValue => ({
    ...document,
    children: transformChildren(document.children, applied),
    ...(document.meta
      ? {
          meta: Object.fromEntries(
            Object.entries(document.meta).filter(([key]) => key !== 'authored')
          ),
        }
      : {}),
    ...(document.roots
      ? {
          roots: Object.fromEntries(
            Object.entries(document.roots).map(([root, children]) => [
              root,
              transformChildren(children, applied),
            ])
          ),
        }
      : {}),
  });
  const ordered = [...records.values()].toSorted(
    (left, right) =>
      left.createdAt - right.createdAt ||
      left.firstLocation.localeCompare(right.firstLocation) ||
      left.id.localeCompare(right.id)
  );
  const applied = new Set<string>();
  const revisions = ordered.map((entry) => {
    applied.add(entry.id);

    return Object.freeze({
      authorId: entry.authorId,
      createdAt: entry.createdAt,
      id: entry.id,
      proposed: documentFor(applied),
    });
  });

  return Object.freeze({
    accepted: documentFor(new Set()),
    revisions: Object.freeze(revisions),
  });
};
