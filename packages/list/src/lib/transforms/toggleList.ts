import type { Element, NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { getInjectMatch, KEYS } from 'platejs';

import type { ListOptions } from './indentList';

import { BaseListPlugin } from '../BaseListPlugin';
import {
  type GetSiblingListOptions,
  getListAbove,
  getPreviousList,
} from '../queries';
import { getListSequenceSiblingOptions } from '../internal/isSameListSequence';
import { normalizeListSequence } from '../normalizers/normalizeListSequence';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { setListNodes } from './setListNodes';
import { setListSiblingNodes } from './setListSiblingNodes';
import { toggleListSet } from './toggleListSet';
import { toggleListUnset } from './toggleListUnset';

/** Toggle indent list. */
export const toggleList = (
  editor: BasePlateEditor,
  options: ListOptions,
  getSiblingListOptions?: GetSiblingListOptions<Element>
) => {
  const { listRestart, listRestartPolite, listStyleType } = options;
  const { getSiblingListOptions: pluginGetSiblingListOptions } =
    editor.getOptions(BaseListPlugin);
  const mergedGetSiblingListOptions = {
    ...pluginGetSiblingListOptions,
    ...getSiblingListOptions,
  } as GetSiblingListOptions<Element>;

  /**
   * True - One or more blocks were converted to lists or changed such that they
   * remain lists.
   *
   * False - One or more list blocks were unset.
   *
   * Null - No action was taken.
   */
  const setList = ((): boolean | null => {
    if (editor.api.isCollapsed()) {
      const entry = editor.api.block() as NodeEntry<Element> | undefined;

      if (!entry) return null;
      if (toggleListSet(editor, entry, options)) {
        return true;
      }
      if (toggleListUnset(editor, entry, { listStyleType })) {
        return false;
      }

      setListSiblingNodes(editor, entry as NodeEntry<Element>, {
        getSiblingListOptions: mergedGetSiblingListOptions,
        listStyleType,
      });

      return true;
    }
    if (editor.api.isExpanded()) {
      const match = getInjectMatch(
        editor,
        editor.getPlugin({ key: KEYS.list })
      );
      const _entries = editor.api.nodes({ block: true, match });
      const entries = [..._entries] as NodeEntry<Element>[];

      const eqListStyleType = areEqListStyleType(editor, entries, {
        listStyleType,
      });

      if (eqListStyleType) {
        editor.update((tx) => {
          entries.forEach((entry) => {
            const [node, path] = entry;

            const indent = node[KEYS.indent] as number;

            tx.nodes.unset(KEYS.listType, { at: path });

            if (indent > 1) {
              tx.nodes.set({ [KEYS.indent]: indent - 1 }, { at: path });
            } else {
              tx.nodes.unset([KEYS.indent, KEYS.listChecked], {
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
        normalizeListSequence(
          editor,
          entries[0][1],
          mergedGetSiblingListOptions
        );

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

    const isFirst = !getPreviousList(
      editor,
      entry,
      getListSequenceSiblingOptions(editor, {
        breakOnEqIndentNeqListStyleType: false,
        ...mergedGetSiblingListOptions,
      })
    );

    /**
     * Only apply listRestartPolite if this is the first item and restartValue >
     * 1.
     */
    if (!isRestart && (!isFirst || restartValue <= 0)) {
      normalizeListSequence(editor, entry[1], mergedGetSiblingListOptions);

      return;
    }

    // If restartValue is 1, only apply listRestart if this is not the first
    if (isRestart && restartValue === 1 && isFirst) {
      normalizeListSequence(editor, entry[1], mergedGetSiblingListOptions);

      return;
    }

    const prop = isRestart ? KEYS.listRestart : KEYS.listRestartPolite;

    editor.update((tx) => {
      tx.nodes.set({ [prop]: restartValue }, { at: entry[1] });
    });
    normalizeListSequence(editor, entry[1], mergedGetSiblingListOptions);
  }
};
