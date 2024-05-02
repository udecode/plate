import {
  EElement,
  PlateEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-common/server';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { getIndentListSiblings, GetIndentListSiblingsOptions } from './index';

/**
 * Get the first sibling list style type at the given indent.
 * If none, return the entry list style type.
 */
export const getSiblingListStyleType = <V extends Value = Value>(
  editor: PlateEditor<V>,
  {
    entry,
    indent,
    ...options
  }: {
    entry: TNodeEntry<TElement>;
    indent: number;
  } & GetIndentListSiblingsOptions<EElement<V>, V>
) => {
  const siblingEntry: TNodeEntry<TElement> = [
    { ...entry[0], indent },
    entry[1],
  ];

  const siblings = getIndentListSiblings(editor, siblingEntry as any, {
    eqIndent: true,
    current: false,
    breakOnEqIndentNeqListStyleType: false,
    ...options,
  });

  return (
    siblings.length > 0
      ? siblings[0][0][KEY_LIST_STYLE_TYPE]
      : entry[0][KEY_LIST_STYLE_TYPE]
  ) as ListStyleType;
};
