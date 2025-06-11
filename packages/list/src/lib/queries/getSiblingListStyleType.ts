import type { ElementOf, NodeEntry, SlateEditor, TElement } from 'platejs';

import { KEYS } from 'platejs';

import type { ListStyleType } from '../types';

import { type GetListSiblingsOptions, getListSiblings } from './index';

/**
 * Get the first sibling list style type at the given indent. If none, return
 * the entry list style type.
 */
export const getSiblingListStyleType = <E extends SlateEditor>(
  editor: E,
  {
    entry,
    indent,
    ...options
  }: {
    entry: NodeEntry<TElement>;
    indent: number;
  } & GetListSiblingsOptions<ElementOf<E>, E>
) => {
  const siblingEntry: NodeEntry<TElement> = [{ ...entry[0], indent }, entry[1]];

  const siblings = getListSiblings(editor, siblingEntry as any, {
    breakOnEqIndentNeqListStyleType: false,
    current: false,
    eqIndent: true,
    ...options,
  });

  return (
    siblings.length > 0
      ? siblings[0][0][KEYS.listType]
      : entry[0][KEYS.listType]
  ) as ListStyleType;
};
