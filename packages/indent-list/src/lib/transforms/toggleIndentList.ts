import type {
  ElementEntryOf,
  ElementOf,
  SlateEditor,
  TElement,
} from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import type { GetSiblingIndentListOptions } from '../queries';
import type { IndentListOptions } from './indentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
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
  const { listStyleType } = options;

  const { getSiblingIndentListOptions: _getSiblingIndentListOptions } =
    editor.getOptions(BaseIndentListPlugin);

  if (editor.api.isCollapsed()) {
    const entry = editor.api.block<TElement>();

    if (!entry) return;
    if (toggleIndentListSet(editor, entry, { listStyleType })) {
      return;
    }
    if (toggleIndentListUnset(editor, entry, { listStyleType })) {
      return;
    }

    setIndentListSiblingNodes(editor, entry as ElementEntryOf<E>, {
      getSiblingIndentListOptions: {
        ..._getSiblingIndentListOptions,
        ...getSiblingIndentListOptions,
      } as GetSiblingIndentListOptions<ElementOf<E>, E>,
      listStyleType,
    });

    return;
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

      return;
    }

    setIndentListNodes(editor, entries, { listStyleType });
  }
};
