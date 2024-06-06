import type { Path } from 'slate';

import {
  type TEditor,
  type Value,
  setElements,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../createIndentListPlugin';
import { ListStyleType } from '../types';

export const setIndentListNode = <V extends Value>(
  editor: TEditor<V>,
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
    { [KEY_INDENT]: newIndent, [KEY_LIST_STYLE_TYPE]: listStyleType },
    { at }
  );
};

export const setIndentTodoNode = <V extends Value>(
  editor: TEditor<V>,
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
      [KEY_INDENT]: newIndent,
      [KEY_LIST_CHECKED]: false,
      [KEY_LIST_STYLE_TYPE]: listStyleType,
    },
    { at }
  );
};
