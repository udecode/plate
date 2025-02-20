import type { KeyboardHandler } from '@udecode/plate/react';

import { isHotkey, PathApi } from '@udecode/plate';

import { ColumnPlugin } from './ColumnPlugin';

export const onKeyDownColumn: KeyboardHandler = ({ editor, event }) => {
  if (event.defaultPrevented) return;

  const at = editor.selection;

  if (isHotkey('mod+a', event) && at) {
    const aboveNode = editor.api.above();
    const ancestorNode = editor.api.block({ highest: true });

    if (!ancestorNode) return;
    if (!aboveNode) return;

    const [node] = ancestorNode;

    if (node.type !== ColumnPlugin.key) return;

    const [, abovePath] = aboveNode;

    let targetPath = PathApi.parent(abovePath);

    if (editor.api.isAt({ block: true, end: true, start: true })) {
      targetPath = PathApi.parent(targetPath);
    }
    if (targetPath.length === 0) return;

    editor.tf.select(targetPath);

    event.preventDefault();
    event.stopPropagation();
  }
};
