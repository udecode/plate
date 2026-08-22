import {
  type Descendant,
  DocumentChange,
  type JsonEditorValue,
} from '@platejs/plite';
import type * as Y from 'yjs';

import {
  createYjsNode,
  createYjsPropertyContext,
  getYjsVisibleChildren,
  indexYjsPropertyContexts,
  insertYjsChild,
  readPliteValueFromYjs,
  removeYjsChild,
  type YjsSetPropertyResolver,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
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
  root: Y.XmlElement,
  before: readonly Descendant[],
  after: readonly Descendant[],
  isSetValued: YjsSetPropertyResolver = () => false,
  schemaRootName: string | null = null
): YjsCanonicalChangeResult => {
  const visibleChildren = getYjsVisibleChildren(root, root);

  if (
    replaceCompatibleYjsChildren(
      root,
      visibleChildren,
      before,
      after,
      0,
      isSetValued,
      { ancestors: [], path: [], root: schemaRootName }
    )
  ) {
    return { inserted: 0, removed: 0, start: 0, strategy: 'compatible' };
  }

  const start = findUnchangedPrefix(before, after);
  const suffix = findUnchangedSuffix(before, after, start);
  const removed = before.length - start - suffix;
  const inserted = after.length - start - suffix;

  let removedVisible = 0;

  while (
    removedVisible < removed &&
    getYjsVisibleChildren(root, root).length > start
  ) {
    removeYjsChild(root, root, start);
    removedVisible += 1;
  }

  for (let index = 0; index < inserted; index++) {
    const child = after[start + index];

    if (child === undefined) {
      throw new Error('Cannot lower a sparse canonical Yjs change.');
    }

    insertYjsChild(
      root,
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
  base,
  canonicalize = (children) => children,
  change,
  emptyValue,
  expected,
  knownYjsValue,
  isSetValued = () => false,
  root,
  yRoot,
}: {
  base: readonly Descendant[];
  canonicalize?: (children: readonly Descendant[]) => readonly Descendant[];
  change: DocumentChange;
  emptyValue?: readonly Descendant[];
  expected: readonly Descendant[];
  knownYjsValue: readonly Descendant[];
  isSetValued?: YjsSetPropertyResolver;
  root: string;
  yRoot: Y.XmlElement;
}): YjsCanonicalChangeResult => {
  const yjsBefore = readPliteValueFromYjs(yRoot, emptyValue);
  const before = canonicalize(yjsBefore);

  if (areJsonLikeValuesEqual(before, expected)) {
    return { inserted: 0, removed: 0, start: 0, strategy: 'compatible' };
  }

  if (!areJsonLikeValuesEqual(before, base)) {
    if (areJsonLikeValuesEqual(before, knownYjsValue)) {
      return reconcileYjsRoot(
        yRoot,
        yjsBefore,
        expected,
        isSetValued,
        schemaRoot(root)
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
    yRoot,
    yjsBefore,
    after,
    isSetValued,
    schemaRoot(root)
  );
};
