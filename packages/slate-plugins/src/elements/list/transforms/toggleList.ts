import {
  getNodes,
  setDefaults,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import { Editor, Transforms } from 'slate';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';
import { unwrapList } from './unwrapList';

export const toggleList = (
  editor: Editor,
  {
    typeList,
    ...options
  }: {
    typeList: string;
  } & ListOptions
) => {
  if (!editor.selection) return;

  const { p, li } = setDefaults(options, DEFAULTS_LIST);

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
