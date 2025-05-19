import type {
  ElementOf,
  NodeEntry,
  SlateEditor,
  TElement,
} from '@udecode/plate';

import type { ListStyleType } from '../types';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
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
      ? siblings[0][0][INDENT_LIST_KEYS.listStyleType]
      : entry[0][INDENT_LIST_KEYS.listStyleType]
  ) as ListStyleType;
};
