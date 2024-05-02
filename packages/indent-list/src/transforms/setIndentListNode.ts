import { setElements, TEditor, Value } from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';
import { Path } from 'slate';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../createIndentListPlugin';
import { ListStyleType } from '../types';

export const setIndentListNode = <V extends Value>(
  editor: TEditor<V>,
  {
    listStyleType = ListStyleType.Disc,
    indent = 0,
    at,
  }: {
    listStyleType?: string;
    indent?: number;
    at: Path;
  }
) => {
  const newIndent = indent || indent + 1;

  setElements(
    editor,
    { [KEY_LIST_STYLE_TYPE]: listStyleType, [KEY_INDENT]: newIndent },
    { at }
  );
};

export const setIndentTodoNode = <V extends Value>(
  editor: TEditor<V>,
  {
    listStyleType = KEY_TODO_STYLE_TYPE,
    indent = 0,
    at,
  }: {
    listStyleType?: string;
    indent?: number;
    at: Path;
  }
) => {
  const newIndent = indent || indent + 1;

  setElements(
    editor,
    {
      [KEY_LIST_STYLE_TYPE]: listStyleType,
      [KEY_LIST_CHECKED]: false,
      [KEY_INDENT]: newIndent,
    },
    { at }
  );
};
