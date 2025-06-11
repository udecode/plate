import type { Editor, Path } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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
      [KEYS.indent]: newIndent,
      [KEYS.listType]: listStyleType,
    },
    { at }
  );
};

export const setIndentTodoNode = (
  editor: Editor,
  {
    at,
    indent = 0,
    listStyleType = KEYS.listTodo,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  const newIndent = indent || indent + 1;

  editor.tf.setNodes(
    {
      [KEYS.indent]: newIndent,
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
    },
    { at }
  );
};
