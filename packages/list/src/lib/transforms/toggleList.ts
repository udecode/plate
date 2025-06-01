import type {
  ElementEntryOf,
  ElementOf,
  SlateEditor,
  TElement,
} from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { ListOptions } from './indentList';

import { BaseListPlugin } from '../BaseListPlugin';
import {
  type GetSiblingListOptions,
  getListAbove,
  getPreviousList,
} from '../queries';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { setListNodes } from './setListNodes';
import { setListSiblingNodes } from './setListSiblingNodes';
import { toggleListSet } from './toggleListSet';
import { toggleListUnset } from './toggleListUnset';

/** Toggle indent list. */
export const toggleList = <
  N extends ElementOf<E>,
  E extends SlateEditor = SlateEditor,
>(
  editor: E,
  options: ListOptions,
  getSiblingListOptions?: GetSiblingListOptions<N, E>
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
  const setList = ((): boolean | null => {
    const { getSiblingListOptions: _getSiblingListOptions } =
      editor.getOptions(BaseListPlugin);

    if (editor.api.isCollapsed()) {
      const entry = editor.api.block<TElement>();

      if (!entry) return null;
      if (toggleListSet(editor, entry, options)) {
        return true;
      }
      if (toggleListUnset(editor, entry, { listStyleType })) {
        return false;
      }

      setListSiblingNodes(editor, entry as ElementEntryOf<E>, {
        getSiblingListOptions: {
          ..._getSiblingListOptions,
          ...getSiblingListOptions,
        } as GetSiblingListOptions<ElementOf<E>, E>,
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

            const indent = node[KEYS.indent] as number;

            editor.tf.unsetNodes(KEYS.listType, { at: path });

            if (indent > 1) {
              editor.tf.setNodes({ [KEYS.indent]: indent - 1 }, { at: path });
            } else {
              editor.tf.unsetNodes([KEYS.indent, KEYS.listChecked], {
                at: path,
              });
            }
            // setListNode(editor, {
            //   listStyleType,
            //   indent: node[KEYS.indent],
            //   at: path,
            // });
          });
        });

        return false;
      }

      setListNodes(editor, entries, { listStyleType });
      return true;
    }

    return null;
  })();

  // Apply listRestart or listRestartPolite if applicable
  const restartValue = listRestart || listRestartPolite;
  const isRestart = !!listRestart;

  if (setList && restartValue) {
    const atStart = editor.api.start(editor.selection!);
    const entry = getListAbove(editor, { at: atStart });
    if (!entry) return;

    const isFirst = !getPreviousList(editor, entry);

    /**
     * Only apply listRestartPolite if this is the first item and restartValue >
     * 1.
     */
    if (!isRestart && (!isFirst || restartValue <= 0)) return;

    // If restartValue is 1, only apply listRestart if this is not the first
    if (isRestart && restartValue === 1 && isFirst) return;

    const prop = isRestart ? KEYS.listRestart : KEYS.listRestartPolite;

    editor.tf.setNodes({ [prop]: restartValue }, { at: entry[1] });
  }
};
