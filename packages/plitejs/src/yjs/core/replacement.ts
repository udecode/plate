import type * as Y from 'yjs';

import type { Descendant } from '../../index';
import {
  getYjsAttributes,
  setYjsAttribute,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  assertPublicYjsAttributeCanBeSet,
  createYjsPropertyContext,
  createYjsVisibleChildrenReader,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
  type YjsVisibleChildrenReader,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  encodeYjsSetValueAttributes,
  getYjsSetValueAttributeKeys,
} from './set-valued-attributes';
import {
  createYjsRunEncoder,
  rewriteTextRuns,
  segmentPliteChildren,
  segmentYjsChildren,
  writeTextRuns,
} from './text-runs';

const getElementAttributes = (node: Descendant): YjsAttributeRecord =>
  Object.fromEntries(
    Object.entries(node).filter(([key]) => key !== 'children')
  );

export const setYjsElementAttributes = (
  node: Y.XmlElement,
  properties: YjsAttributeRecord,
  newProperties: YjsAttributeRecord,
  isSetValued: (key: string) => boolean = () => false
): void => {
  let stored: YjsAttributeRecord | undefined;
  const readStored = () => (stored ??= getYjsAttributes(node));
  // A key's set entries are found by what the node stores, not by
  // `isSetValued`, because a type change can make a key set-valued only under
  // the old type.
  const removeSetEntries = (key: string, kept: YjsAttributeRecord = {}) => {
    for (const encodedKey of getYjsSetValueAttributeKeys(readStored(), key)) {
      if (!Object.hasOwn(kept, encodedKey)) node.removeAttribute(encodedKey);
    }
  };

  for (const key in newProperties) {
    if (!Object.hasOwn(newProperties, key)) {
      continue;
    }

    const value = newProperties[key];

    assertPublicYjsAttributeCanBeSet(key);

    if (isSetValued(key)) {
      if (!Array.isArray(value)) {
        throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
      }

      const encoded = encodeYjsSetValueAttributes(key, value);

      node.removeAttribute(key);
      removeSetEntries(key, encoded);
      for (const [encodedKey, encodedValue] of Object.entries(encoded)) {
        if (areJsonLikeValuesEqual(readStored()[encodedKey], encodedValue)) {
          continue;
        }

        setYjsAttribute(node, encodedKey, encodedValue);
      }

      continue;
    }

    if (value === null || value === undefined) {
      removeSetEntries(key);
      if (properties[key] === null || properties[key] === undefined) {
        continue;
      }

      node.removeAttribute(key);
      continue;
    }

    if (areJsonLikeValuesEqual(properties[key], value)) {
      continue;
    }

    removeSetEntries(key);

    setYjsAttribute(node, key, value);
  }

  for (const key in properties) {
    if (!Object.hasOwn(properties, key)) {
      continue;
    }

    if (Object.hasOwn(newProperties, key)) {
      continue;
    }
    assertPublicYjsAttributeCanBeSet(key);
    node.removeAttribute(key);
    removeSetEntries(key);
  }
};

export const sameSkeleton = (
  before: readonly Descendant[],
  after: readonly Descendant[]
): boolean => {
  const left = segmentPliteChildren(before);
  const right = segmentPliteChildren(after);
  return (
    left.length === right.length &&
    left.every((segment, index) => {
      const next = right[index];
      return segment.kind === 'text'
        ? next.kind === 'text'
        : next.kind === 'element' &&
            sameSkeleton(segment.node.children, next.node.children);
    })
  );
};

const canReplace = (
  read: YjsVisibleChildrenReader,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start: number
): boolean => {
  if (!sameSkeleton(before, after)) return false;
  const physical = segmentYjsChildren(children.slice(start));
  const segments = segmentPliteChildren(before);
  const nextSegments = segmentPliteChildren(after);
  return (
    physical.length === segments.length &&
    segments.every((segment, index) => {
      const target = physical[index];
      const next = nextSegments[index];
      return segment.kind === 'text'
        ? target.kind === 'text'
        : target.kind === 'element' &&
            next.kind === 'element' &&
            canReplace(
              read,
              read(target.node),
              segment.node.children,
              next.node.children,
              0
            );
    })
  );
};

export const canReplaceCompatibleYjsChildren = (
  root: Y.XmlElement,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start = 0
): boolean =>
  canReplace(
    createYjsVisibleChildrenReader(root),
    children,
    before,
    after,
    start
  );

export const replaceCompatibleYjsChildren = (
  root: Y.XmlElement,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start = 0,
  isSetValued: YjsSetPropertyResolver = () => false,
  location: YjsPropertyLocation = { ancestors: [], path: [], root: null },
  /** Whether `before` sits under an element whose type `after` changes. */
  retyped = false
): boolean => {
  const read = createYjsVisibleChildrenReader(root);
  if (!canReplace(read, children, before, after, start)) return false;
  const physical = segmentYjsChildren(children.slice(start));
  const oldSegments = segmentPliteChildren(before);
  const newSegments = segmentPliteChildren(after);
  for (const [index, target] of physical.entries()) {
    const previous = oldSegments[index];
    const next = newSegments[index];
    if (
      target.kind === 'text' &&
      previous.kind === 'text' &&
      next.kind === 'text'
    ) {
      const encode = createYjsRunEncoder(isSetValued, {
        ...location,
        offset: (location.offset ?? start) + next.from,
      });
      // Text under a retyped element was stored under the old type's rules, so
      // it is compared with what the chain stores rather than re-encoded.
      if (retyped) rewriteTextRuns(target.chain, next.leaves, encode);
      else writeTextRuns(target.chain, previous.leaves, next.leaves, encode);
    } else if (
      target.kind === 'element' &&
      previous.kind === 'element' &&
      next.kind === 'element'
    ) {
      const context = createYjsPropertyContext(next.node, {
        ...location,
        path: [...location.path, (location.offset ?? start) + next.from],
      });
      setYjsElementAttributes(
        target.node,
        getElementAttributes(previous.node),
        getElementAttributes(next.node),
        (key) => isSetValued(next.node, key, context)
      );
      replaceCompatibleYjsChildren(
        root,
        read(target.node),
        previous.node.children,
        next.node.children,
        0,
        isSetValued,
        {
          ancestors: [context.type, ...context.ancestors],
          path: context.path,
          root: context.root,
        },
        retyped || previous.node.type !== next.node.type
      );
    }
  }
  return true;
};
