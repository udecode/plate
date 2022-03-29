import {
  getBlockAbove,
  getNodes,
  isCollapsed,
  isExpanded,
  PlateEditor,
  TElement,
} from '@udecode/plate-core';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { IndentListOptions } from './indentList';
import { outdentList } from './outdentList';
import { setIndentListNodes } from './setIndentListNodes';
import { setIndentListSiblingNodes } from './setIndentListSiblingNodes';
import { toggleIndentListSet } from './toggleIndentListSet';
import { toggleIndentListUnset } from './toggleIndentListUnset';

/**
 * Increase the indentation of the selected blocks.
 */
export const toggleIndentList = (
  editor: PlateEditor,
  options: IndentListOptions
) => {
  const { listStyleType } = options;

  if (isCollapsed(editor.selection)) {
    const entry = getBlockAbove(editor);
    if (!entry) return;

    if (toggleIndentListSet(editor, entry, { listStyleType })) {
      return;
    }

    if (toggleIndentListUnset(editor, entry, { listStyleType })) {
      return;
    }

    setIndentListSiblingNodes(editor, entry, { listStyleType });
    return;
  }

  if (isExpanded(editor.selection)) {
    const _entries = getNodes<TElement>(editor, { block: true });
    const entries = [..._entries];

    const eqListStyleType = areEqListStyleType(editor, entries, {
      listStyleType,
    });

    if (eqListStyleType) {
      outdentList(editor, options);
      return;
    }

    setIndentListNodes(editor, entries, { listStyleType });
  }
};
