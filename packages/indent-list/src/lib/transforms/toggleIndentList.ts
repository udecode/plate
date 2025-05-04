import type {
  ElementEntryOf,
  ElementOf,
  SlateEditor,
  TElement,
} from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import {
  type GetSiblingIndentListOptions,
  getIndentListAbove,
  getPreviousIndentList,
} from '../queries';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { setIndentListNodes } from './setIndentListNodes';
import { setIndentListSiblingNodes } from './setIndentListSiblingNodes';
import { toggleIndentListSet } from './toggleIndentListSet';
import { toggleIndentListUnset } from './toggleIndentListUnset';

/** Toggle indent list. */
export const toggleIndentList = <
  N extends ElementOf<E>,
  E extends SlateEditor = SlateEditor,
>(
  editor: E,
  options: IndentListOptions,
  getSiblingIndentListOptions?: GetSiblingIndentListOptions<N, E>
) => {
  const { listRestart, listRestartPolite, listStyleType } = options;

  /**
   * True - One or more blocks were converted to lists or changed such that they
   * remain lists.
   *
   * False - One or more list blocks were unset.
   *
   * Null - No action was taken.
   */
  const setIndentList = ((): boolean | null => {
    const { getSiblingIndentListOptions: _getSiblingIndentListOptions } =
      editor.getOptions(BaseIndentListPlugin);

    if (editor.api.isCollapsed()) {
      const entry = editor.api.block<TElement>();

      if (!entry) return null;
      if (toggleIndentListSet(editor, entry, options)) {
        return true;
      }
      if (toggleIndentListUnset(editor, entry, { listStyleType })) {
        return false;
      }

      setIndentListSiblingNodes(editor, entry as ElementEntryOf<E>, {
        getSiblingIndentListOptions: {
          ..._getSiblingIndentListOptions,
          ...getSiblingIndentListOptions,
        } as GetSiblingIndentListOptions<ElementOf<E>, E>,
        listStyleType,
      });

      return true;
    }
    if (editor.api.isExpanded()) {
      const _entries = editor.api.nodes<TElement>({ block: true });
      const entries = [..._entries];

      const eqListStyleType = areEqListStyleType(editor, entries, {
        listStyleType,
      });

      if (eqListStyleType) {
        editor.tf.withoutNormalizing(() => {
          entries.forEach((entry) => {
            const [node, path] = entry;

            const indent = node[BaseIndentPlugin.key] as number;

            editor.tf.unsetNodes(BaseIndentListPlugin.key, { at: path });

            if (indent > 1) {
              editor.tf.setNodes(
                { [BaseIndentPlugin.key]: indent - 1 },
                { at: path }
              );
            } else {
              editor.tf.unsetNodes(
                [BaseIndentPlugin.key, INDENT_LIST_KEYS.checked],
                {
                  at: path,
                }
              );
            }
            // setIndentListNode(editor, {
            //   listStyleType,
            //   indent: node[BaseIndentPlugin.key],
            //   at: path,
            // });
          });
        });

        return false;
      }

      setIndentListNodes(editor, entries, { listStyleType });
      return true;
    }

    return null;
  })();

  // Apply listRestart or listRestartPolite if applicable
  const restartValue = listRestart || listRestartPolite;
  const isRestart = !!listRestart;

  if (setIndentList && restartValue) {
    const atStart = editor.api.start(editor.selection!);
    const entry = getIndentListAbove(editor, { at: atStart });
    if (!entry) return;

    const isFirst = !getPreviousIndentList(editor, entry);

    /**
     * Only apply listRestartPolite if this is the first item and restartValue >
     * 1.
     */
    if (!isRestart && (!isFirst || restartValue <= 0)) return;

    // If restartValue is 1, only apply listRestart if this is not the first
    if (isRestart && restartValue === 1 && isFirst) return;

    const prop = isRestart
      ? INDENT_LIST_KEYS.listRestart
      : INDENT_LIST_KEYS.listRestartPolite;

    editor.tf.setNodes({ [prop]: restartValue }, { at: entry[1] });
  }
};
