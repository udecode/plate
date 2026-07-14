import type { BaseEditor } from '@platejs/core';
import { getInjectMatch } from '@platejs/core';
import { type Element, ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListOptions } from './indentList';

import { BaseListPlugin } from '../BaseListPlugin';
import {
  type GetSiblingListOptions,
  getListAbove,
  getPreviousList,
} from '../queries';
import { getListSequenceSiblingOptions } from '../internal/isSameListSequence';
import { areEqListStyleType } from '../queries/areEqListStyleType';
import { setListNodes } from './setListNodes';
import { setListSiblingNodes } from './setListSiblingNodes';
import { toggleListSet } from './toggleListSet';
import { toggleListUnset } from './toggleListUnset';

/** Toggle indent list. */
export const toggleList = <N extends Element = Element>(
  editor: BaseEditor,
  options: ListOptions,
  getSiblingListOptions?: GetSiblingListOptions<N>
) => {
  const { listRestart, listRestartPolite, listStyleType } = options;
  const { getSiblingListOptions: pluginGetSiblingListOptions } = editor
    .plugin(BaseListPlugin)
    .getOptions();
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
    if (editor.read.selection.isCollapsed()) {
      const entry = editor.read.nodes.block<Element>();

      if (!entry) return null;
      if (toggleListSet(editor, entry, options)) {
        return true;
      }
      if (toggleListUnset(editor, entry, { listStyleType })) {
        return false;
      }

      setListSiblingNodes(editor, entry, {
        getSiblingListOptions: mergedGetSiblingListOptions,
        listStyleType,
      });

      return true;
    }
    if (editor.read.selection.isExpanded()) {
      const match = getInjectMatch(
        editor,
        editor.getPlugin({ key: KEYS.list })
      );
      const entries = editor.read.nodes.toArray<Element>({
        match: (node, path) =>
          ElementApi.isElement(node) &&
          editor.read.nodes.isBlock(node) &&
          match(node, path),
      });

      const eqListStyleType = areEqListStyleType(editor, entries, {
        listStyleType,
      });

      if (eqListStyleType) {
        editor.update.withoutNormalizing(() => {
          entries.forEach((entry) => {
            const [node, path] = entry;

            const indent = node[KEYS.indent] as number;

            editor.update.nodes.unset(KEYS.listType, { at: path });

            if (indent > 1) {
              editor.update.nodes.set(
                { [KEYS.indent]: indent - 1 },
                { at: path }
              );
            } else {
              editor.update.nodes.unset([KEYS.indent, KEYS.listChecked], {
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
    const selection = editor.read.selection();
    if (!selection) return;

    const atStart = editor.read.points.start(selection);
    if (!atStart) return;
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
    if (!isRestart && (!isFirst || restartValue <= 0)) return;

    // If restartValue is 1, only apply listRestart if this is not the first
    if (isRestart && restartValue === 1 && isFirst) return;

    const prop = isRestart ? KEYS.listRestart : KEYS.listRestartPolite;

    editor.update.nodes.set({ [prop]: restartValue }, { at: entry[1] });
  }
};
