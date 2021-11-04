import { setNodes } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from '../defaults';
import { getNextIndentList } from '../queries/getNextIndentList';
import { getPreviousIndentList } from '../queries/getPreviousIndentList';

export const normalizeListStart = (
  editor: PlateEditor,
  nodeEntry: NodeEntry
) => {
  const [node, path] = nodeEntry;
  const listStyleType = node[KEY_LIST_STYLE_TYPE];

  if (listStyleType) {
    const prevNodeEntry = getPreviousIndentList(editor, nodeEntry);
    if (!prevNodeEntry && node[KEY_LIST_START] > 1) {
      setNodes(editor, { [KEY_LIST_START]: 1 }, { at: path });
    }

    const nextNodeEntry = getNextIndentList(editor, nodeEntry);
    if (!nextNodeEntry) return;

    const [nextNode, nextPath] = nextNodeEntry;

    const listStart = node[KEY_LIST_START] ?? 1;
    const nextListStart = nextNode[KEY_LIST_START] ?? 1;

    if (nextListStart !== listStart + 1) {
      setNodes(editor, { [KEY_LIST_START]: listStart + 1 }, { at: nextPath });
      normalizeListStart(editor, [nextNode, nextPath]);
    }
  }
};
