import {
  ELEMENT_DEFAULT,
  getNodes,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: SPEditor, { type }: { type: string }) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, { match: { type } });

  unwrapList(editor);

  Transforms.setNodes(editor, {
    type: getSlatePluginType(editor, ELEMENT_DEFAULT),
  } as any);

  if (!isActive) {
    const list = { type, children: [] };
    wrapNodes(editor, list);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getSlatePluginType(editor, ELEMENT_DEFAULT) },
      }),
    ];

    const listItem = {
      type: getSlatePluginType(editor, ELEMENT_LI),
      children: [],
    };

    for (const [, path] of nodes) {
      Transforms.wrapNodes(editor, listItem, {
        at: path,
      });
    }
  }
};
