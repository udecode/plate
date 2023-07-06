import {
  EElement,
  EElementEntry,
  TEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';

import { getIndentListSiblings } from '../queries/getIndentListSiblings';
import { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';
import { ListStyleType } from '../types';
import { setIndentListNode } from './setIndentListNode';

/**
 * Set indent list to entry + siblings.
 */
export const setIndentListSiblingNodes = <
  N extends EElement<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  {
    listStyleType = ListStyleType.Disc,
    getSiblingIndentListOptions,
  }: {
    listStyleType?: string;
    getSiblingIndentListOptions?: GetSiblingIndentListOptions<N, V>;
  }
) => {
  withoutNormalizing(editor, () => {
    const siblings = getIndentListSiblings(
      editor,
      entry,
      getSiblingIndentListOptions
    );

    siblings.forEach(([node, path]) => {
      setIndentListNode(editor, {
        listStyleType,
        indent: node[KEY_INDENT] as number,
        at: path,
      });
    });
  });
};
