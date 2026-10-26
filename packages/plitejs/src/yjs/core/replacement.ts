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
  insertYjsChild,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
  type YjsVisibleChildrenReader,
  type YjsWrite,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  encodeYjsSetValueAttributes,
  getYjsSetValueAttributeKeys,
} from './set-valued-attributes';
import {
  alignYjsChildren,
  createYjsRunEncoder,
  createYjsTextChain,
  isBareTextRun,
  isEmptyTextRun,
  rewriteTextRuns,
  segmentPliteChildren,
  writeTextRuns,
  type YjsSegment,
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

/**
 * Whether the change removes the listed child at an index with its open
 * token, so the element it inserts there is a new node.
 */
export type YjsReplacedElement = (index: number) => boolean;

const notReplaced: YjsReplacedElement = () => false;

/**
 * Pairs each Plite segment with the Yjs segment it writes to. Yjs stores no
 * child for an empty Plite text, so such a run pairs with null. Inside an
 * element, letters or props it gains get a new Yjs text at its place; among
 * the listed children, whose parent is unknown, it must stay empty. A listed
 * element pairs only when the change keeps it, because a peer's edit to the
 * old node must not reach the new one.
 */
const alignReplacement = (
  read: YjsVisibleChildrenReader,
  parent: Y.XmlElement | null,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start: number,
  replaced: YjsReplacedElement
): Array<YjsSegment | null> | null => {
  if (!sameSkeleton(before, after)) return null;
  const aligned = alignYjsChildren(before, children.slice(start));
  const nextSegments = segmentPliteChildren(after);
  return aligned &&
    aligned.segments.every((segment, index) => {
      const target = aligned.targets[index];
      const next = nextSegments[index];
      if (!target) return parent !== null || isEmptyTextRun(next);
      return (
        segment.kind === 'text' ||
        (target.kind === 'element' &&
          next.kind === 'element' &&
          !replaced(segment.from) &&
          alignReplacement(
            read,
            target.node,
            read(target.node),
            segment.node.children,
            next.node.children,
            0,
            notReplaced
          ) !== null)
      );
    })
    ? aligned.targets
    : null;
};

export const canReplaceCompatibleYjsChildren = (
  root: Y.XmlElement,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start = 0,
  replaced: YjsReplacedElement = notReplaced
): boolean =>
  alignReplacement(
    createYjsVisibleChildrenReader(root),
    null,
    children,
    before,
    after,
    start,
    replaced
  ) !== null;

const writeReplacement = (
  write: YjsWrite,
  read: YjsVisibleChildrenReader,
  parent: Y.XmlElement | null,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start: number,
  isSetValued: YjsSetPropertyResolver,
  location: YjsPropertyLocation,
  retyped: boolean,
  replaced: YjsReplacedElement
): boolean => {
  const physical = alignReplacement(
    read,
    parent,
    children,
    before,
    after,
    start,
    replaced
  );
  if (!physical) return false;
  const oldSegments = segmentPliteChildren(before);
  const newSegments = segmentPliteChildren(after);
  for (const [index, target] of physical.entries()) {
    const previous = oldSegments[index];
    const next = newSegments[index];
    const encode = () =>
      createYjsRunEncoder(isSetValued, {
        ...location,
        offset: (location.offset ?? start) + next.from,
      });
    if (!target) {
      if (parent && next.kind === 'text' && !isBareTextRun(next)) {
        const anchor = physical[index + 1];
        const visible = read(parent);
        insertYjsChild(
          write,
          parent,
          anchor?.kind === 'element'
            ? visible.indexOf(anchor.node)
            : visible.length,
          createYjsTextChain(next.leaves, encode())
        );
      }
      continue;
    }
    if (
      target.kind === 'text' &&
      previous.kind === 'text' &&
      next.kind === 'text'
    ) {
      // Text under a retyped element was stored under the old type's rules, so
      // it is compared with what the chain stores rather than re-encoded.
      if (retyped) rewriteTextRuns(target.chain, next.leaves, encode());
      else writeTextRuns(target.chain, previous.leaves, next.leaves, encode());
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
      writeReplacement(
        write,
        read,
        target.node,
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
        retyped || previous.node.type !== next.node.type,
        notReplaced
      );
    }
  }
  return true;
};

export const replaceCompatibleYjsChildren = (
  write: YjsWrite,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start = 0,
  isSetValued: YjsSetPropertyResolver = () => false,
  location: YjsPropertyLocation = { ancestors: [], path: [], root: null },
  /** Whether `before` sits under an element whose type `after` changes. */
  retyped = false,
  replaced: YjsReplacedElement = notReplaced
): boolean =>
  writeReplacement(
    write,
    createYjsVisibleChildrenReader(write.root),
    null,
    children,
    before,
    after,
    start,
    isSetValued,
    location,
    retyped,
    replaced
  );
