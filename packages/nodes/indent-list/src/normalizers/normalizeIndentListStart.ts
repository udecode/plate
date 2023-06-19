import {
  EElement,
  EElementEntry,
  getNode,
  setElements,
  TEditor,
  TNodeEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  KEY_LIST_RESTART,
  KEY_LIST_START,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';
import { getNextIndentList } from '../queries/getNextIndentList';
import { getPreviousIndentList } from '../queries/getPreviousIndentList';
import { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';
import { normalizeFirstIndentListStart } from './normalizeFirstIndentListStart';

export const normalizeNextIndentListStart = <V extends Value>(
  editor: TEditor<V>,
  entry: TNodeEntry,
  prevEntry?: TNodeEntry
) => {
  const [node, path] = entry;
  const [prevNode] = prevEntry ?? [null];

  const prevListStart = (prevNode?.[KEY_LIST_START] as number) ?? 1;
  const currListStart = (node[KEY_LIST_START] as number) ?? 1;
  const restart = node[KEY_LIST_RESTART];
  const listStart = restart == null ? prevListStart + 1 : restart;

  if (currListStart !== listStart) {
    setElements(editor, { [KEY_LIST_START]: listStart }, { at: path });
    return true;
  }

  return false;
};

export const normalizeIndentListStart = <
  N extends EElement<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  options?: Partial<GetSiblingIndentListOptions<N, V>>
) => {
  return withoutNormalizing(editor, () => {
    const [node] = entry;
    const listStyleType = (node as any)[KEY_LIST_STYLE_TYPE];

    if (!listStyleType) return;

    let normalized: boolean | undefined = false;

    let prevEntry = getPreviousIndentList(editor, entry, options);

    if (!prevEntry) {
      normalized = normalizeFirstIndentListStart(editor, entry);

      // if no prevEntry and not normalized, nothing happened: next should not be normalized
      if (!normalized) return;
    }

    let normalizeNext = true;

    let currEntry: EElementEntry<V> | undefined = entry;

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
