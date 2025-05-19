import type { Editor, Path } from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
import { ListStyleType } from '../types';

export const setListNode = (
  editor: Editor,
  {
    at,
    indent = 0,
    listStyleType = ListStyleType.Disc,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  const newIndent = indent || indent + 1;

  editor.tf.setNodes(
    {
      [BaseIndentPlugin.key]: newIndent,
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
    },
    { at }
  );
};

export const setIndentTodoNode = (
  editor: Editor,
  {
    at,
    indent = 0,
    listStyleType = INDENT_LIST_KEYS.todo,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  const newIndent = indent || indent + 1;

  editor.tf.setNodes(
    {
      [BaseIndentPlugin.key]: newIndent,
      [INDENT_LIST_KEYS.checked]: false,
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
    },
    { at }
  );
};
