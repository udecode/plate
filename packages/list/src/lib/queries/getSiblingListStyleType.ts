import type { Element, NodeEntry } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import type { ListStyleType } from '../types';

import { type GetListSiblingsOptions, getListSiblings } from './index';

/**
 * Get the first sibling list style type at the given indent. If none, return
 * the entry list style type.
 */
export const getSiblingListStyleType = (
  editor: SlateEditor,
  {
    entry,
    indent,
    ...options
  }: {
    entry: NodeEntry<Element>;
    indent: number;
  } & GetListSiblingsOptions<Element>
) => {
  const siblingEntry: NodeEntry<Element> = [{ ...entry[0], indent }, entry[1]];

  const siblings = getListSiblings(editor, siblingEntry, {
    breakOnEqIndentNeqListStyleType: false,
    current: false,
    eqIndent: true,
    ...options,
  });

  return (
    siblings.length > 0
      ? (siblings[0][0] as Record<string, unknown>)[KEYS.listType]
      : (entry[0] as Record<string, unknown>)[KEYS.listType]
  ) as ListStyleType;
};
