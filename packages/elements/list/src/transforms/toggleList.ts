import {
  ELEMENT_DEFAULT,
  getNodes,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: Editor, { type }: { type: string }) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, { match: { type } });

  unwrapList(editor);

  Transforms.setNodes(editor, {
    type: getPluginType(editor, ELEMENT_DEFAULT),
  } as any);

  if (!isActive) {
    const list = { type, children: [] };
    wrapNodes(editor, list);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getPluginType(editor, ELEMENT_DEFAULT) },
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
