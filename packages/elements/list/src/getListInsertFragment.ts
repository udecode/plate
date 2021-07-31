import { findNode } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  SPEditor,
  TDescendant,
} from '@udecode/plate-core';
import { Path, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getListInsertFragment = (editor: SPEditor) => {
  const { insertFragment } = editor;

  return (fragment: TDescendant[]) => {
    const li = getPlatePluginOptions(editor, ELEMENT_LI);
    const ul = getPlatePluginOptions(editor, ELEMENT_UL);
    const ol = getPlatePluginOptions(editor, ELEMENT_OL);

    const liEntry = findNode(editor, { match: { type: li.type } });

    let filtered: TDescendant[] = [];

    if (liEntry) {
      const [, liPath] = liEntry;

      fragment.forEach((node) => {
        if ([ul.type, ol.type].includes(node.type)) {
          filtered.push(...node.children);
          return;
        }

        filtered.push(node);
      });

      // FIXME: fork insertFragment for edge cases
      Transforms.insertNodes(editor, filtered, {
        at: Path.next(liPath),
        select: true,
      });
      return;
    }
    filtered = fragment;

    const firstNode = fragment[0];

    if ([ul.type, ol.type].includes(firstNode.type)) {
      filtered = [{ text: '' }, ...filtered];
    }

    return insertFragment(filtered);
  };
};
