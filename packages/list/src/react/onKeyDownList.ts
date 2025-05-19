import type { KeyboardHandler } from '@udecode/plate/react';

import { type TElement, isHotkey } from '@udecode/plate';

import type { ListConfig } from './ListPlugin';

import { INDENT_LIST_KEYS, outdentList } from '../lib';

export const onKeyDownList: KeyboardHandler<ListConfig> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;
  if (!editor.selection) return;

  const entry = editor.api.block();

  if (!entry) return;

  const node = entry[0] as TElement;

  const listStyleType = node[INDENT_LIST_KEYS.listStyleType] as
    | string
    | undefined;

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
