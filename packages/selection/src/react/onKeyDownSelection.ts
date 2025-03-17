import type { KeyboardHandler } from '@udecode/plate/react';

import { isHotkey } from '@udecode/plate';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

export const onKeyDownSelection: KeyboardHandler<BlockSelectionConfig> = ({
  api,
  editor,
  event,
}) => {
  if (isHotkey('mod+a', event)) {
    if (event.defaultPrevented) return;

    const ancestorNode = editor.api.block({ highest: true });

    if (!ancestorNode) return;

    const [, path] = ancestorNode;

    if (editor.api.isAt({ block: true, end: true, start: true })) {
      return api.blockSelection.selectAll();
    }
    // TODO： should select the blocks then selected all should exclude table and columns
    if (!editor.api.isAt({ block: true })) {
      return api.blockSelection.selectAll();
    }

    editor.tf.select(path);

    event.preventDefault();
    event.stopPropagation();
  }
  if (isHotkey('escape', event)) {
    if (event.defaultPrevented) return;

    const ancestorNode = editor.api.block({ highest: true });
    const id = ancestorNode?.[0].id as string;

    api.blockSelection.set(id);

    event.preventDefault();
    event.stopPropagation();
  }
};
