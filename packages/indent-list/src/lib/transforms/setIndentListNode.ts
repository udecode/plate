import type { Path } from 'slate';

import { type TEditor, setElements } from '@udecode/plate-common';
import { IndentPlugin } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS, IndentListPlugin } from '../IndentListPlugin';
import { ListStyleType } from '../types';

export const setIndentListNode = (
  editor: TEditor,
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

  setElements(
    editor,
    { [IndentListPlugin.key]: listStyleType, [IndentPlugin.key]: newIndent },
    { at }
  );
};

export const setIndentTodoNode = (
  editor: TEditor,
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

  setElements(
    editor,
    {
      [INDENT_LIST_KEYS.checked]: false,
      [IndentListPlugin.key]: listStyleType,
      [IndentPlugin.key]: newIndent,
    },
    { at }
  );
};
