import type { BaseEditor } from '@platejs/core';
import { type Element, type Path, ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from '../BaseListPlugin';

import { getListTypes } from '../queries/index';

export const unwrapList = (
  editor: BaseEditor,
  tx: ListTransaction,
  { at }: { at?: Path } = {}
) => {
  const selection = tx.selection();
  const selectedListItem =
    !at && selection && tx.selection.isCollapsed()
      ? tx.nodes.above<Element>({
          at: selection.focus,
          match: { type: editor.getType(KEYS.li) },
          mode: 'lowest',
        })
      : undefined;

  if (selectedListItem && selectedListItem[1].at(-1) === 0) {
    const list = tx.nodes.parent<Element>(selectedListItem[1]);
    const content = tx.nodes.get<Element>([...selectedListItem[1], 0]);
    const sublist = tx.nodes.get<Element>([...selectedListItem[1], 1]);

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
    if (tx.nodes.above({ at, match: { type: getListTypes(editor) } })) {
      return true;
    }
    // The selection's common node might be a list type
    const selection = tx.selection();

    if (!at && selection) {
      const commonPath = PathApi.common(
        selection.anchor.path,
        selection.focus.path
      );
      const commonNode = tx.nodes.get(commonPath);

      if (
        commonNode &&
        ElementApi.isElement(commonNode[0]) &&
        getListTypes(editor).includes(commonNode[0].type)
      ) {
        return true;
      }
    }

    return false;
  };

  const unwrap = () => {
    const contentRefs = Array.from(
      tx.nodes.entries<Element>({
        at,
        match: { type: editor.getType(KEYS.lic) },
        mode: 'all',
      }),
      ([, path]) =>
        tx.refs.path(path, {
          association: 'forward',
          deletion: 'nearest',
        })
    );

    do {
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

    for (const ref of contentRefs) {
      const path = ref.resolve();

      if (!path) continue;

      const entry = tx.nodes.get<Element>(path);
      const parent = tx.nodes.parent<Element>(path);

      if (
        entry?.[0].type === editor.getType(KEYS.lic) &&
        parent?.[0].type !== editor.getType(KEYS.li)
      ) {
        tx.nodes.set({ type: editor.getType(KEYS.p) }, { at: path });
      }
    }
  };

  unwrap();
};
