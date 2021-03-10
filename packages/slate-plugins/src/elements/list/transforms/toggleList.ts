import { getNodes, someNode, wrapNodes } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { unwrapList } from './unwrapList';

export const toggleList = (
  editor: Editor,
  { typeList }: { typeList: string },
  options: SlatePluginsOptions
) => {
  const { p, li } = options;

  if (!editor.selection) return;

  const isActive = someNode(editor, { match: { type: typeList } });

  unwrapList(editor, options);

  Transforms.setNodes(editor, {
    type: p.type,
  });

  if (!isActive) {
    const list = { type: typeList, children: [] };
    wrapNodes(editor, list);

    const nodes = [...getNodes(editor, { match: { type: p.type } })];

    const listItem = { type: li.type, children: [] };

    for (const [, path] of nodes) {
      Transforms.wrapNodes(editor, listItem, {
        at: path,
      });
    }
  }
};
