import {
  getBlockAbove,
  getNodeEntries,
  getPluginOptions,
  isCollapsed,
  isExpanded,
  PlateEditor,
  setElements,
  TElement,
  unsetNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';

import {
  IndentListPlugin,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { IndentListOptions } from './indentList';
import { setIndentListNodes } from './setIndentListNodes';
import { setIndentListSiblingNodes } from './setIndentListSiblingNodes';
import { toggleIndentListSet } from './toggleIndentListSet';
import { toggleIndentListUnset } from './toggleIndentListUnset';

/**
 * Toggle indent list.
 */
export const toggleIndentList = <V extends Value>(
  editor: PlateEditor<V>,
  options: IndentListOptions<V>
) => {
  const { listStyleType } = options;

  const { getSiblingIndentListOptions } = getPluginOptions<IndentListPlugin, V>(
    editor,
    KEY_LIST_STYLE_TYPE
  );

  if (isCollapsed(editor.selection)) {
    const entry = getBlockAbove<TElement>(editor);
    if (!entry) return;

    if (toggleIndentListSet(editor, entry, { listStyleType })) {
      return;
    }

    if (toggleIndentListUnset(editor, entry, { listStyleType })) {
      return;
    }

    setIndentListSiblingNodes(editor, entry, {
      listStyleType,
      getSiblingIndentListOptions,
    });
    return;
  }

  if (isExpanded(editor.selection)) {
    const _entries = getNodeEntries<TElement>(editor, { block: true });
    const entries = [..._entries];

    const eqListStyleType = areEqListStyleType(editor, entries, {
      listStyleType,
    });

    if (eqListStyleType) {
      withoutNormalizing(editor, () => {
        entries.forEach((entry) => {
          const [node, path] = entry;

          const indent = node[KEY_INDENT] as number;

          unsetNodes(editor, KEY_LIST_STYLE_TYPE, { at: path });
          if (indent > 1) {
            setElements(editor, { [KEY_INDENT]: indent - 1 }, { at: path });
          } else {
            unsetNodes(editor, KEY_INDENT, { at: path });
          }
          // setIndentListNode(editor, {
          //   listStyleType,
          //   indent: node[KEY_INDENT],
          //   at: path,
          // });
        });
      });
      return;
    }

    setIndentListNodes(editor, entries, { listStyleType });
  }
};
