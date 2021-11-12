import { getNode } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry, Path } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';

export const getNextIndentList = (
  editor: PlateEditor,
  [node, path]: NodeEntry,
  {
    sameStyleType = true,
  }: { sameIndent?: boolean; sameStyleType?: boolean } = {}
): NodeEntry | undefined => {
  const indent = node[KEY_INDENT];
  const listStyleType = node[KEY_LIST_STYLE_TYPE];

  let nextPath = Path.next(path);

  while (true) {
    const nextNode = getNode(editor, nextPath);

    if (!nextNode || !nextNode[KEY_INDENT] || nextNode[KEY_INDENT] < indent) {
      return;
    }

    if (nextNode[KEY_INDENT] === indent) {
      if (sameStyleType && nextNode[KEY_LIST_STYLE_TYPE] !== listStyleType) {
        return;
      }

      return [nextNode, nextPath];
    }

    nextPath = Path.next(nextPath);
  }
};
