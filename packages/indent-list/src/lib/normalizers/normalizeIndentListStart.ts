import {
  type ElementEntryOf,
  type ElementOf,
  type TEditor,
  type TNodeEntry,
  getNode,
  setElements,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { getNextIndentList } from '../queries/getNextIndentList';
import { getPreviousIndentList } from '../queries/getPreviousIndentList';
import { normalizeFirstIndentListStart } from './normalizeFirstIndentListStart';

export const normalizeNextIndentListStart = (
  editor: TEditor,
  entry: TNodeEntry,
  prevEntry?: TNodeEntry
) => {
  const [node, path] = entry;
  const [prevNode] = prevEntry ?? [null];

  const prevListStart = (prevNode?.[INDENT_LIST_KEYS.listStart] as number) ?? 1;
  const currListStart = (node[INDENT_LIST_KEYS.listStart] as number) ?? 1;
  const restart = node[INDENT_LIST_KEYS.listRestart];
  const listStart = restart == null ? prevListStart + 1 : restart;

  if (currListStart !== listStart) {
    setElements(
      editor,
      { [INDENT_LIST_KEYS.listStart]: listStart },
      { at: path }
    );

    return true;
  }

  return false;
};

export const normalizeIndentListStart = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingIndentListOptions<N, E>>
) => {
  return withoutNormalizing(editor, () => {
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
      prevEntry = [getNode<N>(editor, currEntry[1])!, currEntry[1]];
      currEntry = getNextIndentList(editor, currEntry, options);

      if (!currEntry) break;
    }

    return normalized;
  });
};
