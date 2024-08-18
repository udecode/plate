import type { KeyboardHandler } from '@udecode/plate-common/react';

import {
  getAboveNode,
  getAncestorNode,
  isHotkey,
  isSelectionCoverBlock,
  select,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { type ColumnConfig, ColumnPlugin } from './ColumnPlugin';

export const onKeyDownColumn: KeyboardHandler<ColumnConfig> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;

  const at = editor.selection;

  if (isHotkey('mod+a', event) && at) {
    const aboveNode = getAboveNode(editor);
    const ancestorNode = getAncestorNode(editor);

    if (!ancestorNode) return;
    if (!aboveNode) return;

    const [node] = ancestorNode;

    if (node.type !== ColumnPlugin.key) return;

    const [, abovePath] = aboveNode;

    let targetPath = Path.parent(abovePath);

    if (isSelectionCoverBlock(editor)) {
      targetPath = Path.parent(targetPath);
    }
    if (targetPath.length === 0) return;

    select(editor, targetPath);

    event.preventDefault();
    event.stopPropagation();
  }
};
