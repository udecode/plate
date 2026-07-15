import type { BaseEditor } from '@platejs/core';
import { type Element, type Path, ElementApi, NodeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from '../BaseListPlugin';

import { getListTypes } from '../queries/index';

export const unwrapList = (
  editor: BaseEditor,
  tx: ListTransaction,
  { at }: { at?: Path } = {}
) => {
  const selection = editor.read.selection();
  const selectedListItem =
    !at && selection && editor.read.selection.isCollapsed()
      ? editor.read.nodes.above<Element>({
          at: selection.focus,
          match: { type: editor.getType(KEYS.li) },
          mode: 'lowest',
        })
      : undefined;

  if (selectedListItem && selectedListItem[1].at(-1) === 0) {
    const list = editor.read.nodes.parent<Element>(selectedListItem[1]);
    const content = editor.read.nodes.get<Element>([...selectedListItem[1], 0]);
    const sublist = editor.read.nodes.get<Element>([...selectedListItem[1], 1]);

    if (list && content && sublist && list[0].children.length > 1) {
      const paragraph = {
        ...content[0],
        type: editor.getType(KEYS.p),
      };
      const nextList = {
        ...list[0],
        children: [...sublist[0].children, ...list[0].children.slice(1)],
      };
      const paragraphPath = list[1];
      const point = {
        offset: selection!.focus.offset,
        path: [
          ...paragraphPath,
          ...selection!.focus.path.slice(content[1].length),
        ],
      };

      tx.nodes.replace([paragraph, nextList], { at: list[1] });
      tx.selection.set({ anchor: point, focus: point });

      return;
    }
  }

  const ancestorListTypeCheck = () => {
    if (
      editor.read.nodes.above({ at, match: { type: getListTypes(editor) } })
    ) {
      return true;
    }
    // The selection's common node might be a list type
    const selection = editor.read.selection();

    if (!at && selection) {
      const commonNode = NodeApi.common(
        editor,
        selection.anchor.path,
        selection.focus.path
      )!;

      if (
        ElementApi.isElement(commonNode[0]) &&
        getListTypes(editor).includes(commonNode[0].type)
      ) {
        return true;
      }
    }

    return false;
  };

  const unwrap = () => {
    do {
      // const licEntry = editor.read.nodes.block({
      //   at,
      //   match: { type: editor.getType(BaseListItemContentPlugin) },
      // });

      // Allow other LIC types
      // if (licEntry) {
      //   editor.update.nodes.set(
      //     { type: editor.getType(BaseParagraphPlugin) },
      //     { at }
      //   );
      // }

      tx.nodes.unwrap({
        at,
        match: { type: editor.getType(KEYS.li) },
        split: true,
      });

      tx.nodes.unwrap({
        at,
        match: {
          type: getListTypes(editor),
        },
        split: true,
      });
    } while (ancestorListTypeCheck());
  };

  unwrap();
};
