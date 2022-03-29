import { TEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { getNextIndentList } from './getNextIndentList';
import { getPreviousIndentList } from './getPreviousIndentList';
import { GetSiblingIndentListOptions } from './getSiblingIndentList';

export interface GetIndentListSiblingsOptions
  extends Partial<GetSiblingIndentListOptions> {
  previous?: boolean;
  current?: boolean;
  next?: boolean;
}

export const getIndentListSiblings = (
  editor: TEditor,
  entry: NodeEntry,
  {
    previous = true,
    current = true,
    next = true,
    ...options
  }: GetIndentListSiblingsOptions = {}
) => {
  const siblings: NodeEntry[] = [];

  const [node] = entry;

  if (!node[KEY_LIST_STYLE_TYPE]) return siblings;

  let iterEntry = entry;

  if (previous) {
    while (true) {
      const prevEntry = getPreviousIndentList(editor, iterEntry, options);
      if (!prevEntry) break;

      siblings.push(prevEntry);

      iterEntry = prevEntry;
    }
  }

  if (current) {
    siblings.push(entry);
  }

  if (next) {
    iterEntry = entry;

    while (true) {
      const nextEntry = getNextIndentList(editor, iterEntry, options);
      if (!nextEntry) break;

      siblings.push(nextEntry);

      iterEntry = nextEntry;
    }
  }

  return siblings;
};
