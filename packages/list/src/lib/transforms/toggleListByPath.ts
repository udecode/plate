import type { BaseEditor } from '@platejs/core';
import type { Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const toggleListByPath = (
  editor: BaseEditor,
  [node, path]: NodeEntry<Element>,
  listStyleType: string
) => {
  editor.update.nodes.set(
    {
      [KEYS.indent]: node[KEYS.indent] ?? 1,
      // TODO: normalized if not todo remove this property.
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
      type: KEYS.p,
    },
    {
      at: path,
    }
  );
};

export const toggleListByPathUnSet = (
  editor: BaseEditor,
  [, path]: NodeEntry<Element>
) =>
  editor.update.nodes.unset([KEYS.listType, KEYS.indent, KEYS.listChecked], {
    at: path,
  });
