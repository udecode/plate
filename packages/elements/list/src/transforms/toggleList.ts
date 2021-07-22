import {
  ELEMENT_DEFAULT,
  getNodes,
  setNodes,
  someNode,
  wrapNodes,
} from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { Editor } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../defaults';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: SPEditor, { type }: { type: string }) => {
  if (!editor.selection) return;

  Editor.withoutNormalizing(editor, () => {
    const isActive = someNode(editor, { match: { type } });

    unwrapList(editor);

    setNodes<TElement>(editor, {
      type: getPlatePluginType(editor, ELEMENT_DEFAULT),
    });

    if (!isActive) {
      const list = { type, children: [] };
      wrapNodes(editor, list);

      const nodes = [
        ...getNodes(editor, {
          match: { type: getPlatePluginType(editor, ELEMENT_DEFAULT) },
        }),
      ];
      setNodes(editor, { type: getPlatePluginType(editor, ELEMENT_LIC) });

      const listItem = {
        type: getPlatePluginType(editor, ELEMENT_LI),
        children: [],
      };

      for (const [, path] of nodes) {
        wrapNodes(editor, listItem, {
          at: path,
        });
      }
    }
  });
};
