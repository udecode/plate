import type { BaseEditor } from '@platejs/core';
import type { Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListStyleType } from '../types';

import { type GetListSiblingsOptions, getListSiblings } from './index';

/**
 * Get the first sibling list style type at the given indent. If none, return
 * the entry list style type.
 */
export const getSiblingListStyleType = <E extends BaseEditor>(
  editor: E,
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
      ? siblings[0][0][KEYS.listType]
      : entry[0][KEYS.listType]
  ) as ListStyleType;
};
