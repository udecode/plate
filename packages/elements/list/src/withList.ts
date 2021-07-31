import { findNode } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  SPEditor,
  TDescendant,
  WithOverride,
} from '@udecode/plate-core';
import { Path, Transforms } from 'slate';
import { getListNormalizer } from './normalizers/getListNormalizer';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';
import { getListDeleteBackward } from './getListDeleteBackward';
import { getListDeleteFragment } from './getListDeleteFragment';
import { getListInsertBreak } from './getListInsertBreak';
import { WithListOptions } from './types';

export const withList = ({
  validLiChildrenTypes,
}: WithListOptions = {}): WithOverride<SPEditor> => (editor) => {
  const {
    insertBreak,
    deleteBackward,
    deleteFragment,
    insertFragment,
  } = editor;

  const li = getPlatePluginOptions(editor, ELEMENT_LI);
  const ul = getPlatePluginOptions(editor, ELEMENT_UL);
  const ol = getPlatePluginOptions(editor, ELEMENT_OL);

  editor.insertBreak = () => {
    if (getListInsertBreak(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (getListDeleteBackward(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteFragment = () => {
    if (getListDeleteFragment(editor)) return;

    deleteFragment();
  };

  editor.insertFragment = (fragment: TDescendant[]) => {
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

    insertFragment(filtered);
  };

  editor.normalizeNode = getListNormalizer(editor, { validLiChildrenTypes });

  return editor;
};
