import type { SlateEditor } from '@platejs/core';
import { type Path, ElementApi, PathApi } from '@platejs/slate';
import { KEYS } from '@platejs/utils';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import { getListTypes } from '../queries/index';

export const unwrapList = (editor: SlateEditor, { at }: { at?: Path } = {}) => {
  const isElementOfType = (node: unknown, type: string) =>
    ElementApi.isElement(node) && node.type === type;
  const isElementOfTypes = (node: unknown, types: string[]) =>
    ElementApi.isElement(node) && types.includes(node.type);

  const ancestorListTypeCheck = () => {
    if (
      editor.api.above({
        at,
        match: (node) => isElementOfTypes(node, getListTypes(editor)),
      })
    ) {
      return true;
    }
    // The selection's common node might be a list type
    if (!at && editor.selection) {
      const commonNode = editor.api.node(
        PathApi.common(
          editor.selection.anchor.path,
          editor.selection.focus.path
        )
      );

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

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
      do {
        tx.nodes.unwrap({
          at,
          match: (node) => isElementOfType(node, editor.getType(KEYS.li)),
          split: true,
        });

        tx.nodes.unwrap({
          at,
          match: (node) => isElementOfTypes(node, getListTypes(editor)),
          split: true,
        });
      } while (ancestorListTypeCheck());
    });
  });
};
