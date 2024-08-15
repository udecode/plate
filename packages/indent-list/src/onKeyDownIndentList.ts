import {
  type KeyboardHandler,
  type TElement,
  getBlockAbove,
  isBlockAboveEmpty,
  isHotkey,
} from '@udecode/plate-common';

import { type IndentListConfig, IndentListPlugin } from './IndentListPlugin';
import { outdentList } from './transforms/index';

export const onKeyDownIndentList: KeyboardHandler<IndentListConfig> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;
  if (!editor.selection) return;

  const entry = getBlockAbove(editor);

  if (!entry) return;

  const node = entry[0] as TElement;

  const listStyleType = node[IndentListPlugin.key] as string | undefined;

  if (!listStyleType) return;
  if (isHotkey('Enter', event) && isBlockAboveEmpty(editor) && node.indent) {
    outdentList(editor);
    event.stopPropagation();
    event.preventDefault();
  }
};
