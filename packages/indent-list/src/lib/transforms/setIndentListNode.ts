import type { Path } from 'slate';

import { type TEditor, setElements } from '@udecode/plate-common';
import { BaseIndentPlugin } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
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
    {
      [BaseIndentListPlugin.key]: listStyleType,
      [BaseIndentPlugin.key]: newIndent,
    },
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
      [BaseIndentListPlugin.key]: listStyleType,
      [BaseIndentPlugin.key]: newIndent,
      [INDENT_LIST_KEYS.checked]: false,
    },
    { at }
  );
};
