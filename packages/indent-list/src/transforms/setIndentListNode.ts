import type { Path } from 'slate';

import { type TEditor, setElements } from '@udecode/plate-common';
import { IndentPlugin } from '@udecode/plate-indent';

import {
  IndentListPlugin,
  KEY_LIST_CHECKED,
  KEY_TODO_STYLE_TYPE,
} from '../IndentListPlugin';
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
    listStyleType = KEY_TODO_STYLE_TYPE,
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
      [IndentListPlugin.key]: listStyleType,
      [IndentPlugin.key]: newIndent,
      [KEY_LIST_CHECKED]: false,
    },
    { at }
  );
};
