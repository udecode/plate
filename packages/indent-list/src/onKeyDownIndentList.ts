import type { KeyboardHandler } from '@udecode/plate-common';

import {
  type TElement,
  getBlockAbove,
  isBlockAboveEmpty,
  isHotkey,
} from '@udecode/plate-common/server';

import {
  type IndentListPluginOptions,
  KEY_LIST_STYLE_TYPE,
} from './IndentListPlugin';
import { outdentList } from './transforms/index';

export const onKeyDownIndentList: KeyboardHandler<IndentListPluginOptions> =
  (editor) => (e) => {
    if (e.defaultPrevented) return;
    if (!editor.selection) return;

    const entry = getBlockAbove(editor);

    if (!entry) return;

    const node = entry[0] as TElement;

    const listStyleType = node[KEY_LIST_STYLE_TYPE] as string | undefined;

    if (!listStyleType) return;
    if (isHotkey('Enter', e) && isBlockAboveEmpty(editor) && node.indent) {
      outdentList(editor);
      e.stopPropagation();
      e.preventDefault();
    }
  };
