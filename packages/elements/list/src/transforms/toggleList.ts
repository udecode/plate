import {
  ELEMENT_DEFAULT,
  getNodes,
  setNodes,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../defaults';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: SPEditor, { type }: { type: string }) => {
  if (!editor.selection) return;

  Editor.withoutNormalizing(editor, () => {
    const isActive = someNode(editor, { match: { type } });

    unwrapList(editor);

    setNodes<TElement>(editor, {
      type: getSlatePluginType(editor, ELEMENT_DEFAULT),
    });

    if (!isActive) {
      const list = { type, children: [] };
      wrapNodes(editor, list);

      const nodes = [
        ...getNodes(editor, {
          match: { type: getSlatePluginType(editor, ELEMENT_DEFAULT) },
        }),
      ];
      setNodes(editor, { type: getSlatePluginType(editor, ELEMENT_LIC) });

      const listItem = {
        type: getSlatePluginType(editor, ELEMENT_LI),
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
