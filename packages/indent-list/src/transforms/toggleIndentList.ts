import {
  type PlateEditor,
  type TElement,
  type Value,
  getBlockAbove,
  getNodeEntries,
  getPluginOptions,
  isCollapsed,
  isExpanded,
  setElements,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import {
  type IndentListPluginOptions,
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
} from '../IndentListPlugin';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { setIndentListNodes } from './setIndentListNodes';
import { setIndentListSiblingNodes } from './setIndentListSiblingNodes';
import { toggleIndentListSet } from './toggleIndentListSet';
import { toggleIndentListUnset } from './toggleIndentListUnset';

/** Toggle indent list. */
export const toggleIndentList = <V extends Value>(
  editor: PlateEditor<V>,
  options: IndentListOptions<V>
) => {
  const { listStyleType } = options;

  const { getSiblingIndentListOptions } =
    getPluginOptions<IndentListPluginOptions>(editor, KEY_LIST_STYLE_TYPE);

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
      getSiblingIndentListOptions,
      listStyleType,
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
            unsetNodes(editor, [KEY_INDENT, KEY_LIST_CHECKED], { at: path });
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
