import { setElements, TEditor, Value } from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';
import { Path } from 'slate';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
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
