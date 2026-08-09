import type {
  ContentSlice as ContentSliceValue,
  Descendant,
  DescendantIn,
  Element,
  Value,
} from '../interfaces';
import { ElementApi } from '../interfaces';
import { PreparedTokenSlice, type JsonNode } from './change/tokens';
import {
  getEditorJsonArrayItems,
  getEditorJsonRecordEntries,
  snapshotEditorJsonValue,
} from './value-codec';

export type ContentSlice<V extends Value = Value> = ContentSliceValue<V>;

type PreparedSlice = Readonly<{
  detached: boolean;
  variants: Map<string, ContentSliceValue>;
}>;

const trustedSlices = new WeakMap<object, PreparedSlice>();
const canonicalContentAuthorities = new WeakMap<object, object>();
const encodedSlices = new WeakMap<object, PreparedTokenSlice>();
const encodedContent = new WeakMap<object, PreparedTokenSlice>();

const assertOpenDepth = (
  content: readonly Descendant[],
  depth: number,
  edge: 'end' | 'start'
) => {
  let children = content;

  for (let level = 0; level < depth; level++) {
    const node = edge === 'start' ? children[0] : children.at(-1);

    if (!ElementApi.isElement(node)) {
      throw new Error(
        `Content slice open ${edge} exceeds its element context.`
      );
    }

    children = node.children;
  }
};

const invalidJson = (): never => {
  throw new Error('Content slice must encode to JSON-compatible data.');
};

const assertOpenDepths = (openStart: unknown, openEnd: unknown) => {
  if (
    !Number.isSafeInteger(openStart) ||
    !Number.isSafeInteger(openEnd) ||
    Object.is(openStart, -0) ||
    Object.is(openEnd, -0) ||
    (openStart as number) < 0 ||
    (openEnd as number) < 0
  ) {
    throw new Error('Content slice open depths must be non-negative integers.');
  }
};

const variantKey = (openStart: number, openEnd: number) =>
  `${openStart}:${openEnd}`;

const snapshotSliceContent = (
  content: unknown,
  path?: readonly number[],
  seen?: WeakSet<object>
): readonly Descendant[] => {
  const nodePath = path ?? [];
  const nodeSeen = seen ?? new WeakSet<object>();

  if (!Array.isArray(content)) {
    throw new Error('Content slice content must be an array.');
  }

  const items = getEditorJsonArrayItems(content) ?? invalidJson();

  const result = items.map((node, index): Descendant => {
    const nextPath = [...nodePath, index];

    if (typeof node !== 'object' || node === null || Array.isArray(node)) {
      throw new Error(
        `Content slice node at [${nextPath}] must be a text or element object.`
      );
    }
    if (nodeSeen.has(node)) {
      throw new Error(
        `Content slice node at [${nextPath}] cannot be repeated or cyclic.`
      );
    }
    nodeSeen.add(node);

    const entries = getEditorJsonRecordEntries(node) ?? invalidJson();

    const hasChildren = entries.some(([key]) => key === 'children');
    const hasText = entries.some(([key]) => key === 'text');

    if (hasChildren === hasText) {
      throw new Error(
        `Content slice node at [${nextPath}] must have exactly one structural field.`
      );
    }

    const props = Object.fromEntries(
      entries
        .filter(([key]) => key !== 'children' && key !== 'text')
        .map(([key, item]) => [
          key,
          snapshotEditorJsonValue(item, 'Content slice'),
        ])
    );

    if (hasText) {
      const text = entries.find(([key]) => key === 'text')![1];

      if (typeof text !== 'string') {
        throw new Error(
          `Content slice text at [${nextPath}] must be a string.`
        );
      }

      return Object.freeze({ ...props, text }) as Descendant;
    }

    const children = entries.find(([key]) => key === 'children')![1];

    return Object.freeze({
      ...props,
      children: snapshotSliceContent(children, nextPath, nodeSeen),
    }) as Descendant;
  });

  return Object.freeze(result);
};

const snapshotContentSlice = <V extends Value>(
  value: unknown
): ContentSliceValue<V> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Content slice must be an object.');
  }

  const entries = getEditorJsonRecordEntries(value) ?? invalidJson();

  const keys = entries.map(([key]) => key).sort();

  if (
    (keys.length !== 3 && keys.length !== 4) ||
    keys[0] !== 'content' ||
    keys[1] !== 'openEnd' ||
    keys[2] !== 'openStart' ||
    (keys.length === 4 && keys[3] !== 'roots')
  ) {
    throw new Error(
      'Content slice must contain only content, openEnd, openStart, and optional roots.'
    );
  }

  const fields = new Map(entries);
  const openStart = fields.get('openStart');
  const openEnd = fields.get('openEnd');
  const seen = new WeakSet<object>();

  assertOpenDepths(openStart, openEnd);
  const rootsValue = fields.get('roots');
  let roots: Readonly<Record<string, readonly Descendant[]>> | undefined;

  if (rootsValue !== undefined) {
    const rootEntries = getEditorJsonRecordEntries(rootsValue) ?? invalidJson();

    roots = Object.freeze(
      Object.fromEntries(
        rootEntries.map(([root, content]) => {
          if (root.length === 0 || root === 'main') {
            throw new Error(
              'Content slice roots must use non-empty named root keys.'
            );
          }

          return [root, snapshotSliceContent(content, undefined, seen)];
        })
      )
    );
  }

  const result = Object.freeze({
    content: snapshotSliceContent(fields.get('content'), undefined, seen),
    openEnd: openEnd as number,
    openStart: openStart as number,
    ...(roots && Object.keys(roots).length > 0 ? { roots } : {}),
  }) as ContentSliceValue<V>;

  assertOpenDepth(result.content, result.openStart, 'start');
  assertOpenDepth(result.content, result.openEnd, 'end');

  return result;
};

const prepare = <V extends Value>(
  result: ContentSliceValue<V>,
  detached: boolean
): ContentSliceValue<V> => {
  const variants = new Map<string, ContentSliceValue>();

  variants.set(variantKey(result.openStart, result.openEnd), result);

  trustedSlices.set(
    result,
    Object.freeze({
      detached,
      variants,
    })
  );

  return result;
};

const snapshot = <V extends Value>(value: unknown): ContentSliceValue<V> =>
  prepare(snapshotContentSlice<V>(value), true);

const fromJSON = <V extends Value = Value>(
  value: unknown
): ContentSliceValue<V> => {
  if (typeof value === 'object' && value !== null && trustedSlices.has(value)) {
    return value as ContentSliceValue<V>;
  }

  return snapshot<V>(value);
};

type SliceValueFromContent<TContent extends readonly Descendant[]> = [
  Extract<TContent[number], Element>,
] extends [never]
  ? Value
  : readonly Extract<TContent[number], Element>[];

function closed<const TContent extends readonly Descendant[]>(
  content: TContent
): ContentSliceValue<SliceValueFromContent<TContent>>;
function closed<V extends Value>(
  content: readonly DescendantIn<V>[]
): ContentSliceValue<V>;
function closed(content: readonly Descendant[]): ContentSliceValue<Value> {
  return snapshot<Value>({
    content,
    openEnd: 0,
    openStart: 0,
  });
}

const empty = closed<never>([]);

/** @internal Trust freshly owned, deeply frozen, shape-validated nodes. */
export const createDetachedContentSlice = <V extends Value>(
  content: readonly DescendantIn<V>[],
  openStart: number,
  openEnd: number,
  options: Readonly<{
    /** Authority attesting that content is owned, deeply frozen, and canonical. */
    canonicalFor?: object;
    /** Detached secondary roots referenced by the slice content. */
    roots?: Readonly<Record<string, readonly DescendantIn<V>[]>>;
  }> = {}
): ContentSliceValue<V> => {
  assertOpenDepths(openStart, openEnd);
  const seen = new WeakSet<object>();
  const assertDeeplyFrozen = (value: unknown): void => {
    if (typeof value !== 'object' || value === null || seen.has(value)) return;
    if (!Object.isFrozen(value)) {
      throw new Error('Prepared content slice nodes must be deeply frozen.');
    }

    seen.add(value);
    for (const key in value) {
      if (Object.hasOwn(value, key)) {
        assertDeeplyFrozen((value as Readonly<Record<string, unknown>>)[key]);
      }
    }
  };

  if (options.canonicalFor) {
    if (
      !Object.isFrozen(content) ||
      (options.roots &&
        (!Object.isFrozen(options.roots) ||
          Object.values(options.roots).some(
            (children) => !Object.isFrozen(children)
          )))
    ) {
      throw new Error(
        'Canonical content slice nodes and roots must be frozen.'
      );
    }
  } else {
    assertDeeplyFrozen(content);
    assertDeeplyFrozen(options.roots);
  }

  const result = Object.freeze({
    content,
    openEnd,
    openStart,
    ...(options.roots && Object.keys(options.roots).length > 0
      ? { roots: options.roots }
      : {}),
  }) as ContentSliceValue<V>;

  assertOpenDepth(result.content, result.openStart, 'start');
  assertOpenDepth(result.content, result.openEnd, 'end');

  if (options.canonicalFor) {
    canonicalContentAuthorities.set(content, options.canonicalFor);
  }

  return prepare(result, true);
};

/** @internal Read the schema authority that constructed canonical slice nodes. */
export const getContentSliceCanonicalAuthority = (slice: ContentSliceValue) =>
  canonicalContentAuthorities.get(fromJSON(slice).content);

/** @internal Trust frozen nodes read directly from an immutable editor snapshot. */
export const createContentSliceFromFragment = <V extends Value>(
  content: readonly Descendant[],
  openStart: number,
  openEnd: number,
  roots?: Readonly<Record<string, readonly Descendant[]>>
): ContentSliceValue<V> => {
  assertOpenDepths(openStart, openEnd);

  if (
    !content.every((node) => Object.isFrozen(node)) ||
    (roots &&
      Object.values(roots).some((children) =>
        children.some((node) => !Object.isFrozen(node))
      ))
  ) {
    return snapshot<V>({
      content,
      openEnd,
      openStart,
      ...(roots ? { roots } : {}),
    });
  }

  const frozenContent = Object.freeze([...content]);
  const frozenRoots =
    roots && Object.keys(roots).length > 0
      ? Object.freeze(
          Object.fromEntries(
            Object.entries(roots).map(([root, children]) => [
              root,
              Object.freeze([...children]),
            ])
          )
        )
      : undefined;

  assertOpenDepth(frozenContent, openStart, 'start');
  assertOpenDepth(frozenContent, openEnd, 'end');

  return prepare(
    Object.freeze({
      content: frozenContent,
      openEnd,
      openStart,
      ...(frozenRoots ? { roots: frozenRoots } : {}),
    }) as ContentSliceValue<V>,
    false
  );
};

/** Immutable open document content carried across host and insertion boundaries. */
export const ContentSlice = Object.freeze({
  closed,
  empty,
  fromJSON,
  withContent: <V extends Value>(
    slice: ContentSliceValue<V>,
    content: readonly DescendantIn<V>[],
    options: Readonly<{ open: 'closed' | 'preserve' }>
  ): ContentSliceValue<V> => {
    if (options.open === 'closed') return closed(content);
    if (options.open !== 'preserve') {
      throw new Error('Content slice openness must be closed or preserved.');
    }

    const source = fromJSON<V>(slice);

    return snapshot<V>({
      content,
      openEnd: source.openEnd,
      openStart: source.openStart,
      ...(source.roots ? { roots: source.roots } : {}),
    });
  },
});

/** @internal Whether a trusted slice owns detached content identities. */
export const isDetachedContentSlice = (slice: ContentSliceValue) =>
  trustedSlices.get(fromJSON(slice))!.detached;

/** @internal Encode the complete trusted content behind a slice. */
export const encodeContentSliceContent = (slice: ContentSliceValue) => {
  const value = fromJSON(slice);
  const prepared = trustedSlices.get(value)!;
  let fullEncoded = encodedContent.get(value.content);

  if (!fullEncoded) {
    fullEncoded = prepared.detached
      ? PreparedTokenSlice.fromPreparedNodes(
          value.content as readonly JsonNode[]
        )
      : PreparedTokenSlice.fromJSON(
          PreparedTokenSlice.fromNodes(
            value.content as readonly JsonNode[]
          ).toJSON()
        );
    encodedContent.set(value.content, fullEncoded);
  }

  return fullEncoded;
};

/** @internal Encode a trusted JSON slice while retaining its open edges. */
export const encodeContentSlice = (slice: ContentSliceValue) => {
  const value = fromJSON(slice);
  let encoded = encodedSlices.get(value);

  if (encoded) return encoded;
  const fullEncoded = encodeContentSliceContent(value);

  encoded = fullEncoded.slice(
    value.openStart,
    fullEncoded.length - value.openEnd
  );
  encodedSlices.set(value, encoded);

  return encoded;
};

/** @internal Reuse one trusted content snapshot with different valid openness. */
export const prepareContentSliceVariant = <V extends Value>(
  slice: ContentSliceValue<V>,
  openStart: number,
  openEnd: number
): ContentSliceValue<V> => {
  assertOpenDepths(openStart, openEnd);

  const source = fromJSON(slice);
  const prepared = trustedSlices.get(source)!;
  const key = variantKey(openStart, openEnd);
  const cached = prepared.variants.get(key);

  if (cached) return cached as ContentSliceValue<V>;

  assertOpenDepth(source.content, openStart, 'start');
  assertOpenDepth(source.content, openEnd, 'end');

  const result = Object.freeze({
    content: source.content,
    openEnd,
    openStart,
    ...(source.roots ? { roots: source.roots } : {}),
  }) as ContentSliceValue<V>;

  trustedSlices.set(
    result,
    Object.freeze({
      detached: prepared.detached,
      variants: prepared.variants,
    })
  );
  prepared.variants.set(key, result);

  return result;
};
