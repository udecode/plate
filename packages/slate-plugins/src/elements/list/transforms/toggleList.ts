import { getNodes, someNode, wrapNodes } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../paragraph/defaults';
import { ELEMENT_LI } from '../defaults';
import { unwrapList } from './unwrapList';

export const toggleList = (
  editor: Editor,
  { typeList }: { typeList: string }
) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, { match: { type: typeList } });

  unwrapList(editor);

  Transforms.setNodes(editor, {
    type: getPluginType(editor, ELEMENT_PARAGRAPH),
  });

  if (!isActive) {
    const list = { type: typeList, children: [] };
    wrapNodes(editor, list);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getPluginType(editor, ELEMENT_PARAGRAPH) },
      }),
    ];

    const listItem = { type: getPluginType(editor, ELEMENT_LI), children: [] };

    for (const [, path] of nodes) {
      Transforms.wrapNodes(editor, listItem, {
        at: path,
      });
    }
  }
};
