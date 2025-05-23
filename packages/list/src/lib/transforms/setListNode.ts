import type { Editor, Path } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
      [KEYS.indent]: newIndent,
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
      [INDENT_LIST_KEYS.checked]: false,
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
      [KEYS.indent]: newIndent,
    },
    { at }
  );
};
