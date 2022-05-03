import {
  getBlockAbove,
  getNodes,
  getPluginOptions,
  isCollapsed,
  isExpanded,
  PlateEditor,
  setNodes,
  TElement,
  unsetNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
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
 * Increase the indentation of the selected blocks.
 */
export const toggleIndentList = <V extends Value>(
  editor: PlateEditor<V>,
  options: IndentListOptions
) => {
  const { listStyleType } = options;

  const { getSiblingIndentListOptions } = getPluginOptions<IndentListPlugin>(
    editor,
    KEY_LIST_STYLE_TYPE
  );

  if (isCollapsed(editor.selection)) {
    const entry = getBlockAbove(editor);
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
    const _entries = getNodes<TElement>(editor, { block: true });
    const entries = [..._entries];

    const eqListStyleType = areEqListStyleType(editor, entries, {
      listStyleType,
    });

    if (eqListStyleType) {
      withoutNormalizing(editor, () => {
        entries.forEach((entry) => {
          const [node, path] = entry;

          unsetNodes(editor, KEY_LIST_STYLE_TYPE, { at: path });
          if (node[KEY_INDENT] > 1) {
            setNodes(
              editor,
              { [KEY_INDENT]: node[KEY_INDENT] - 1 },
              { at: path }
            );
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
