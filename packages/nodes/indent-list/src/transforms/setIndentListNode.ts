import { setNodes, TEditor } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { Path } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';

export const setIndentListNode = (
  editor: TEditor,
  {
    listStyleType = ListStyleType.Disc,
    indent,
    at,
  }: {
    listStyleType?: string;
    indent?: number;
    at: Path;
  }
) => {
  const props = { [KEY_LIST_STYLE_TYPE]: listStyleType };
  if (!indent) {
    props[KEY_INDENT] = 1;
  }
  setNodes(editor, props, { at });
};
