import type { KeyboardHandler } from '@udecode/plate-common';

import {
  getAboveNode,
  getAncestorNode,
  isHotkey,
  isSelectionCoverBlock,
  select,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { ELEMENT_COLUMN_GROUP } from './ColumnPlugin';

export const onKeyDownColumn: KeyboardHandler = (editor) => (e) => {
  if (e.defaultPrevented) return;

  const at = editor.selection;

  if (isHotkey('mod+a', e) && at) {
    const aboveNode = getAboveNode(editor);
    const ancestorNode = getAncestorNode(editor);

    if (!ancestorNode) return;
    if (!aboveNode) return;

    const [node] = ancestorNode;

    if (node.type !== ELEMENT_COLUMN_GROUP) return;

    const [, abovePath] = aboveNode;

    let targetPath = Path.parent(abovePath);

    if (isSelectionCoverBlock(editor)) {
      targetPath = Path.parent(targetPath);
    }
    if (targetPath.length === 0) return;

    select(editor, targetPath);

    e.preventDefault();
    e.stopPropagation();
  }
};
