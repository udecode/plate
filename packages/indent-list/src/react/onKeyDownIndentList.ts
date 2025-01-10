import type { KeyboardHandler } from '@udecode/plate/react';

import { type TElement, isHotkey } from '@udecode/plate';

import { outdentList } from '../lib';
import { type IndentListConfig, IndentListPlugin } from './IndentListPlugin';

export const onKeyDownIndentList: KeyboardHandler<IndentListConfig> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;
  if (!editor.selection) return;

  const entry = editor.api.block();

  if (!entry) return;

  const node = entry[0] as TElement;

  const listStyleType = node[IndentListPlugin.key] as string | undefined;

  if (!listStyleType) return;
  if (
    isHotkey('Enter', event) &&
    editor.api.isEmpty(editor.selection, { block: true }) &&
    node.indent
  ) {
    outdentList(editor);
    event.stopPropagation();
    event.preventDefault();
  }
};
