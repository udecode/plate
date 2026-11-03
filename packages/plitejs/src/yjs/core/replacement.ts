import type * as Y from 'yjs';

import type { Descendant } from '../../index';
import { getDefined } from '../../internal/get-defined';
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
  type YjsKeyStorage,
  type YjsKeyStorageOf,
  type YjsSetPropertyResolver,
  noSetProperties,
  type YjsVisibleChildrenReader,
  yjsKeyStorageOf,
  type YjsWrite,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  holdsNewLetters,
  runLettersAt,
  type YjsLettersAt,
} from './new-letters';
import {
  createYjsSetEditAttributeKey,
  encodeYjsSetValueAttributes,
  getYjsSetEditAttributeKeys,
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
  previousProperties: YjsAttributeRecord,
  newProperties: YjsAttributeRecord,
  storageOf: YjsKeyStorageOf = (): YjsKeyStorage => 'value'
): void => {
  let stored: YjsAttributeRecord | undefined;
  const readStored = () => (stored ??= getYjsAttributes(node));
  const removeSetEntries = (key: string, kept: YjsAttributeRecord = {}) => {
    for (const encodedKey of getYjsSetValueAttributeKeys(readStored(), key)) {
      if (!Object.hasOwn(kept, encodedKey)) node.removeAttribute(encodedKey);
    }
  };
  // Yjs deletes the stored item a peer saw, not the key, so a member this
  // writer's view lacked is set again: the new item outlives a teammate's
  // concurrent delete of the stored one.
  const writeSetEntries = (
    key: string,
    value: readonly unknown[],
    seen?: readonly unknown[]
  ) => {
    const encoded = encodeYjsSetValueAttributes(key, value);
    const unseen =
      seen === undefined
        ? {}
        : encodeYjsSetValueAttributes(
            key,
            value.filter(
              (member) =>
                !seen.some((item) => areJsonLikeValuesEqual(item, member))
            )
          );

    removeSetEntries(key, encoded);
    for (const [encodedKey, encodedValue] of Object.entries(encoded)) {
      if (
        !Object.hasOwn(unseen, encodedKey) &&
        areJsonLikeValuesEqual(readStored()[encodedKey], encodedValue)
      ) {
        continue;
      }

      setYjsAttribute(node, encodedKey, encodedValue);
    }
  };
  const removeSetEdits = (key: string, kept?: string) => {
    for (const editKey of getYjsSetEditAttributeKeys(readStored(), key)) {
      if (editKey !== kept) node.removeAttribute(editKey);
    }
  };
  // A fresh item each time, so a whole-value write that never saw this edit
  // keeps its flag.
  const markSetEdit = (key: string) => {
    const own = createYjsSetEditAttributeKey(
      key,
      getDefined(node.doc).clientID
    );

    removeSetEdits(key, own);
    setYjsAttribute(node, own, true);
  };
  const removeKey = (key: string) => {
    node.removeAttribute(key);
    removeSetEntries(key);
    if (storageOf(key) === 'placed-members') markSetEdit(key);
    else removeSetEdits(key);
  };

  for (const key in newProperties) {
    if (!Object.hasOwn(newProperties, key)) {
      continue;
    }

    const value = newProperties[key];
    const storage = storageOf(key);

    assertPublicYjsAttributeCanBeSet(key);

    if (
      storage === 'members' ||
      (storage === 'placed-members' && value !== null && value !== undefined)
    ) {
      if (!Array.isArray(value)) {
        throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
      }
      if (areJsonLikeValuesEqual(previousProperties[key], value)) continue;

      node.removeAttribute(key);
      if (storage === 'placed-members') {
        const previous = previousProperties[key];

        writeSetEntries(key, value, Array.isArray(previous) ? previous : []);
        markSetEdit(key);
      } else {
        writeSetEntries(key, value);
      }

      continue;
    }

    if (value === null || value === undefined) {
      if (storage !== 'value') {
        removeKey(key);
        continue;
      }
      removeSetEntries(key);
      if (
        previousProperties[key] === null ||
        previousProperties[key] === undefined
      ) {
        continue;
      }

      node.removeAttribute(key);
      continue;
    }

    if (areJsonLikeValuesEqual(previousProperties[key], value)) {
      continue;
    }

    if (storage === 'placed-value') {
      writeSetEntries(key, Array.isArray(value) ? value : []);
      removeSetEdits(key);
    } else {
      removeSetEntries(key);
    }

    setYjsAttribute(node, key, value);
  }

  for (const key in previousProperties) {
    if (!Object.hasOwn(previousProperties, key)) {
      continue;
    }

    if (Object.hasOwn(newProperties, key)) {
      continue;
    }
    assertPublicYjsAttributeCanBeSet(key);
    removeKey(key);
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

// Children the change leaves as they are need no write, so a room that holds
// fewer of them than the editor, such as a line every editor built from a
// spare, still takes the change of their element's properties in place.
const unchanged = (
  before: readonly Descendant[],
  after: readonly Descendant[]
) => before === after || areJsonLikeValuesEqual(before, after);

/**
 * Pairs each Plite segment with the Yjs segment it writes to. Yjs stores no
 * child for an empty Plite text, so such a run pairs with null. Inside an
 * element, letters or props it gains get a new Yjs text at its place; among
 * the listed children, whose parent is unknown, it must stay empty. A listed
 * element pairs only when the change keeps it, because a peer's edit to the
 * old node must not reach the new one. Children that hold new letters are
 * written even when their value is unchanged, so those letters replace the
 * old ones.
 */
const alignReplacement = (
  read: YjsVisibleChildrenReader,
  parent: Y.XmlElement | null,
  children: readonly YjsNode[],
  before: readonly Descendant[],
  after: readonly Descendant[],
  start: number,
  replaced: YjsReplacedElement,
  hasNewLetters = false
): Array<YjsSegment | null> | null => {
  if (
    start === 0 &&
    !hasNewLetters &&
    unchanged(before, after) &&
    !before.some((_, index) => replaced(index))
  ) {
    return [];
  }
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
  replaced: YjsReplacedElement,
  letters: YjsLettersAt | undefined
): boolean => {
  const base = location.offset ?? start;
  const physical = alignReplacement(
    read,
    parent,
    children,
    before,
    after,
    start,
    replaced,
    !!letters?.place &&
      holdsNewLetters(letters.letters, location.path, base, base + after.length)
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
        offset: base + next.from,
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
      const runLetters = runLettersAt(
        letters,
        location.path,
        base + next.from,
        next.leaves,
        previous.from,
        previous.leaves
      );
      // Text under a retyped element was stored under the old type's rules, so
      // it is compared with what the chain stores rather than re-encoded.
      if (retyped) {
        rewriteTextRuns(target.chain, next.leaves, encode(), {
          letters: runLetters,
        });
      } else {
        writeTextRuns(target.chain, previous.leaves, next.leaves, encode(), {
          letters: runLetters,
        });
      }
    } else if (
      target.kind === 'element' &&
      previous.kind === 'element' &&
      next.kind === 'element'
    ) {
      const context = createYjsPropertyContext(next.node, {
        ...location,
        path: [...location.path, base + next.from],
      });
      setYjsElementAttributes(
        target.node,
        getElementAttributes(previous.node),
        getElementAttributes(next.node),
        yjsKeyStorageOf(isSetValued, next.node, context)
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
        notReplaced,
        letters && {
          letters: letters.letters,
          place: letters.place && {
            offset: 0,
            path: [...letters.place.path, letters.place.offset + previous.from],
          },
        }
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
  isSetValued: YjsSetPropertyResolver = noSetProperties,
  location: YjsPropertyLocation = { ancestors: [], path: [], root: null },
  /** Whether `before` sits under an element whose type `after` changes. */
  retyped = false,
  replaced: YjsReplacedElement = notReplaced,
  letters?: YjsLettersAt
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
    replaced,
    letters
  );
