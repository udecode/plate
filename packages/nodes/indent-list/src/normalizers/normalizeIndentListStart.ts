import {
  getNode,
  setNodes,
  TEditor,
  withoutNormalizing,
} from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { getNextIndentList } from '../queries/getNextIndentList';
import { getPreviousIndentList } from '../queries/getPreviousIndentList';
import { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';
import { normalizeFirstIndentListStart } from './normalizeFirstIndentListStart';

export const normalizeNextIndentListStart = (
  editor: TEditor,
  entry: NodeEntry,
  prevEntry?: NodeEntry
) => {
  const [node, path] = entry;
  const [prevNode] = prevEntry ?? [null];

  const prevListStart = prevNode?.[KEY_LIST_START] ?? 1;
  const currListStart = node[KEY_LIST_START] ?? 1;

  const listStart = prevListStart + 1;

  if (currListStart !== listStart) {
    setNodes(editor, { [KEY_LIST_START]: listStart }, { at: path });
    return true;
  }

  return false;
};

export const normalizeIndentListStart = (
  editor: TEditor,
  entry: NodeEntry,
  options?: Partial<GetSiblingIndentListOptions>
) => {
  return withoutNormalizing(editor, () => {
    const [node] = entry;
    const listStyleType = node[KEY_LIST_STYLE_TYPE];

    if (!listStyleType) return;

    let normalized: boolean | undefined = false;

    let prevEntry = getPreviousIndentList(editor, entry, options);

    if (!prevEntry) {
      normalized = normalizeFirstIndentListStart(editor, entry);

      // if no prevEntry and not normalized, next should not be normalized
      if (!normalized) return;
    }

    let normalizeNext = true;

    let currEntry: NodeEntry | undefined = entry;

    // normalize next until current is not normalized
    while (normalizeNext) {
      normalizeNext = normalizeNextIndentListStart(
        editor,
        currEntry,
        prevEntry
      );

      if (normalizeNext) normalized = true;

      // get the node again after setNodes
      prevEntry = [getNode(editor, currEntry[1])!, currEntry[1]];
      currEntry = getNextIndentList(editor, currEntry, options);

      if (!currEntry) break;
    }

    return normalized;
  });
};
