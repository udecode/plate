import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  NodeApi,
  type NodeEntry,
  PathApi,
  type TElement,
} from '@udecode/plate';

import type { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { getNextIndentList } from '../queries/getNextIndentList';
import { getPreviousIndentList } from '../queries/getPreviousIndentList';
import { normalizeFirstIndentListStart } from './normalizeFirstIndentListStart';

function partitionObject(
  obj: Record<string, unknown>,
  filterFn: (x: unknown) => boolean,
): [Record<string, unknown>, Record<string, unknown>] {
  return Object.keys(obj).reduce(
    (result, key) => {
      result[filterFn(obj[key]) ? 0 : 1][key] = obj[key];
      return result;
    },
    [{} as Record<string, unknown>, {} as Record<string, unknown>],
  );
}

export const normalizeNextIndentListStart = (
  editor: Editor,
  entry: NodeEntry,
  prevEntry?: NodeEntry,
) => {
  // `entry` is the current [path, node] tuple, `prevEntry` is the previous list node at the
  // same hierarchy level (not necessarily the immediately preceding node, if there is a
  // nested list in between).
  // So if `prevEntry` is undefined, then the current node is the first item in the list,
  // or the first item in a nested list.
  const [node, path] = entry;
  const [prevNode] = prevEntry ?? [null];

  // N.B. I've chosen to always just use parent list index, and ignore indentation levels
  // (since we are using indent-list, they are independent).
  // We could change it so indenting changes the hierarchy too.
  const listParentIndex = (() => {
    if (!node[BaseIndentListPlugin.key]) {
      // if it's not a list item, remove `listParentIndex`
      return undefined;
    }

    if (prevEntry) {
      // it's the 2nd+ item in a hierarchy level in a list - copy from the previous item
      return prevEntry[0].listParentIndex;
    }

    // get node immediately above
    const previousPath = PathApi.previous(path);
    if (!previousPath) return undefined; // it's the 1st node in the document
    const previousNode = NodeApi.get<TElement>(editor, previousPath);

    if (!previousNode?.[BaseIndentListPlugin.key]) {
      // node above isn't a list item - this one must be the first in the list
      return undefined;
    }

    const prevListStart = previousNode[INDENT_LIST_KEYS.listStart];
    const prevListRestart = previousNode[INDENT_LIST_KEYS.listRestart];
    const prevListParentIndex = previousNode.listParentIndex;
    const prevHierListRestart = previousNode.hierListRestart;

    return `${prevListParentIndex || prevHierListRestart || ''}${prevListStart || prevListRestart || 1}.`;
  })();

  const hierListRestart = (() => {
    const currentValue = node.hierListRestart;

    if (!node[BaseIndentListPlugin.key]) {
      // if it's not a list item, remove `hierListRestart`
      return undefined;
    }

    if (prevEntry) {
      // it's the 2nd+ item in a list, use whatever the previous item has
      return prevEntry[0].hierListRestart;
    }

    // get node immediately above
    const previousPath = PathApi.previous(path);
    if (!previousPath) return currentValue; // if no node above (1st line in doc), return as is
    const previousNode = NodeApi.get<TElement>(editor, previousPath);

    // if it's the first item in a list, and has a hierListRestart, leave it as is
    if (!previousNode?.[BaseIndentListPlugin.key]) {
      return currentValue;
    }

    // it's not the first item in a list, but it's the first in a new hierarchy - clear
    // `hierListRestart`
    return undefined;
  })();

  const listStart = (() => {
    // TODO this isn't firing for first list items - otherwise it would be wrong - there
    // may be some cases where it does fire, in which case will need to improve this.
    if (prevNode?.[INDENT_LIST_KEYS.listRestart]) {
      return (prevNode[INDENT_LIST_KEYS.listRestart] as number) + 1;
    }
    return ((prevNode?.[INDENT_LIST_KEYS.listStart]) as number | undefined ?? 1) + 1;
  })();

  const currListStart = (node[INDENT_LIST_KEYS.listStart] as number) ?? 1;
  const currListParentIndex = node.listParentIndex;
  const currHierListRestart = node.hierListRestart;

  if (
    currListStart !== listStart ||
    currListParentIndex !== listParentIndex ||
    currHierListRestart !== hierListRestart
  ) {
    const [propsToUnset, propsToSet] = partitionObject({listStart, listParentIndex, hierListRestart}, x => x === undefined);
    
    // unset undefined values rather than setting them to the value `undefined`
    if (Object.keys(propsToUnset).length > 0) {
      editor.tf.unsetNodes(Object.keys(propsToUnset), { at: path });
    }
    if (Object.keys(propsToSet).length > 0) {
      editor.tf.setNodes(propsToSet, { at: path });
    }

    return true;
  }

  return false;
};

export const normalizeIndentListStart = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingIndentListOptions<N, E>>
) => {
  return editor.tf.withoutNormalizing(() => {
    const [node] = entry;
    const listStyleType = (node as any)[BaseIndentListPlugin.key];

    if (!listStyleType) return;

    let normalized: boolean | undefined = false;

    let prevEntry = getPreviousIndentList(editor, entry, options);

    if (!prevEntry) {
      normalized = normalizeFirstIndentListStart(editor, entry);

      // if no prevEntry and not normalized, nothing happened: next should not be normalized
      if (!normalized) return;
    }

    let normalizeNext = true;

    let currEntry: ElementEntryOf<E> | undefined = entry;

    // normalize next until current is not normalized
    while (normalizeNext) {
      normalizeNext =
        normalizeNextIndentListStart(editor, currEntry, prevEntry) ||
        normalized;

      if (normalizeNext) normalized = true;

      // get the node again after setNodes
      prevEntry = [NodeApi.get<N>(editor, currEntry[1])!, currEntry[1]];
      currEntry = getNextIndentList(editor, currEntry, options);

      if (!currEntry) break;
    }

    return normalized;
  });
};
