import { countCoreWork } from '../../core/work';
import {
  type Descendant,
  DocumentChange,
  type JsonEditorValue,
} from '../../index';
import {
  createYjsNode,
  createYjsPropertyContext,
  getYjsVisibleChildren,
  indexYjsPropertyContexts,
  insertYjsChild,
  readPliteValueFromYjs,
  removeYjsChild,
  type YjsSetPropertyResolver,
  type YjsTextAdmission,
  type YjsWrite,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import type { YjsLetters } from './new-letters';
import { replaceCompatibleYjsChildren } from './replacement';

const valueForRoot = (
  root: string,
  children: readonly Descendant[]
): JsonEditorValue =>
  root === 'main'
    ? { children }
    : { children: [], roots: { [root]: children } };

const childrenForRoot = (value: JsonEditorValue, root: string) =>
  (root === 'main'
    ? value.children
    : (value.roots?.[root] ?? [])) as readonly Descendant[];

const schemaRoot = (root: string): string | null =>
  root === 'main' ? null : root;

export const createRootDocumentChange = (
  root: string,
  before: readonly Descendant[],
  after: readonly Descendant[],
  isSetValued: YjsSetPropertyResolver = () => false
) => {
  const contexts = indexYjsPropertyContexts(before, schemaRoot(root));

  return DocumentChange.between(
    valueForRoot(root, before),
    valueForRoot(root, after),
    {
      isSetValued: (node, key) => {
        const context = contexts.get(node);

        return context ? isSetValued(node, key, context) : false;
      },
    }
  );
};

export const countChangedTopLevelChildren = (
  before: readonly Descendant[],
  after: readonly Descendant[]
) => {
  const length = Math.max(before.length, after.length);
  let changed = 0;

  for (let index = 0; index < length; index++) {
    if (!areJsonLikeValuesEqual(before[index], after[index])) changed += 1;
  }

  return changed;
};

export const applyRootDocumentChange = (
  change: DocumentChange,
  root: string,
  before: readonly Descendant[]
): readonly Descendant[] =>
  childrenForRoot(change.apply(valueForRoot(root, before)), root);

const findUnchangedPrefix = (
  before: readonly Descendant[],
  after: readonly Descendant[]
) => {
  const limit = Math.min(before.length, after.length);
  let index = 0;

  while (index < limit && areJsonLikeValuesEqual(before[index], after[index])) {
    index += 1;
  }

  return index;
};

const findUnchangedSuffix = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  prefix: number
) => {
  const limit = Math.min(before.length, after.length) - prefix;
  let count = 0;

  while (
    count < limit &&
    areJsonLikeValuesEqual(before.at(-1 - count), after.at(-1 - count))
  ) {
    count += 1;
  }

  return count;
};

export type YjsCanonicalChangeResult = {
  readonly inserted: number;
  readonly removed: number;
  readonly start: number;
  readonly strategy: 'compatible' | 'range';
};

export const reconcileYjsRoot = (
  write: YjsWrite,
  before: readonly Descendant[],
  after: readonly Descendant[],
  isSetValued: YjsSetPropertyResolver = () => false,
  schemaRootName: string | null = null,
  letters?: YjsLetters
): YjsCanonicalChangeResult => {
  countCoreWork('reconciles');

  const { root } = write;
  const visibleChildren = getYjsVisibleChildren(root, root);
  const location = { ancestors: [], path: [], root: schemaRootName };
  // The Yjs texts show the commit's before letters only in the children that
  // read as the commit's before children at the same place.
  const lettersFrom = (from: number, to: number, at: number) =>
    letters && {
      letters,
      place: areJsonLikeValuesEqual(
        before.slice(from, to),
        letters.before.nodes.slice(at, at + to - from)
      )
        ? { offset: at, path: [] }
        : null,
    };

  if (
    replaceCompatibleYjsChildren(
      write,
      visibleChildren,
      before,
      after,
      0,
      isSetValued,
      location,
      false,
      undefined,
      before.length === letters?.before.nodes.length
        ? lettersFrom(0, before.length, 0)
        : undefined
    )
  ) {
    return { inserted: 0, removed: 0, start: 0, strategy: 'compatible' };
  }

  const start = findUnchangedPrefix(before, after);
  const suffix = findUnchangedSuffix(before, after, start);
  const removed = before.length - start - suffix;
  const inserted = after.length - start - suffix;

  // The equal blocks at either edge keep their Yjs nodes, so the new letters
  // they hold are written into them in place.
  if (letters) {
    const { length } = letters.before.nodes;

    for (const [from, to, offset, at] of [
      [0, start, 0, 0],
      [
        before.length - suffix,
        before.length,
        after.length - suffix,
        length - suffix,
      ],
    ] as const) {
      replaceCompatibleYjsChildren(
        write,
        visibleChildren.slice(from, to),
        before.slice(from, to),
        after.slice(offset, offset + to - from),
        0,
        isSetValued,
        { ...location, offset },
        false,
        undefined,
        lettersFrom(from, to, at)
      );
    }
  }

  let removedVisible = 0;

  while (
    removedVisible < removed &&
    getYjsVisibleChildren(root, root).length > start
  ) {
    removeYjsChild(write, root, start);
    removedVisible += 1;
  }

  for (let index = 0; index < inserted; index++) {
    const child = after[start + index];

    if (child === undefined) {
      throw new Error('Cannot lower a sparse canonical Yjs change.');
    }

    insertYjsChild(
      write,
      root,
      start + index,
      createYjsNode(
        child,
        isSetValued,
        createYjsPropertyContext(child, {
          ancestors: [],
          path: [start + index],
          root: schemaRootName,
        })
      )
    );
  }

  return { inserted, removed: removedVisible, start, strategy: 'range' };
};

export const lowerDocumentChangeToYjs = ({
  admitsText,
  base,
  canonicalize = (children) => children,
  change,
  emptyValue,
  expected,
  knownYjsValue,
  isSetValued = () => false,
  letters,
  root,
  write,
}: {
  admitsText?: YjsTextAdmission;
  base: readonly Descendant[];
  canonicalize?: (children: readonly Descendant[]) => readonly Descendant[];
  change: DocumentChange;
  emptyValue?: readonly Descendant[];
  expected: readonly Descendant[];
  knownYjsValue: readonly Descendant[];
  isSetValued?: YjsSetPropertyResolver;
  /** The commit's letters in this root, from `base`'s document to `expected`'s. */
  letters?: YjsLetters;
  root: string;
  write: YjsWrite;
}): YjsCanonicalChangeResult => {
  const yjsBefore = readPliteValueFromYjs(write.root, emptyValue, admitsText);
  const before = canonicalize(yjsBefore);

  if (areJsonLikeValuesEqual(before, expected)) {
    // A room that already reads as the commit can still hold old letters where
    // the commit wrote new ones.
    return letters && areJsonLikeValuesEqual(yjsBefore, base)
      ? reconcileYjsRoot(
          write,
          yjsBefore,
          expected,
          isSetValued,
          schemaRoot(root),
          letters
        )
      : { inserted: 0, removed: 0, start: 0, strategy: 'compatible' };
  }

  if (!areJsonLikeValuesEqual(before, base)) {
    if (areJsonLikeValuesEqual(before, knownYjsValue)) {
      return reconcileYjsRoot(
        write,
        yjsBefore,
        expected,
        isSetValued,
        schemaRoot(root),
        letters
      );
    }

    throw new Error(
      `Canonical Yjs change does not match the synchronized ${root} root.`
    );
  }

  const after = applyRootDocumentChange(change, root, before);

  if (!areJsonLikeValuesEqual(after, expected)) {
    throw new Error(
      `Canonical Yjs change does not produce the committed ${root} root.`
    );
  }

  return reconcileYjsRoot(
    write,
    yjsBefore,
    after,
    isSetValued,
    schemaRoot(root),
    letters
  );
};
