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

    const ancestorNode = editor.api.highestBlock();

    if (!ancestorNode) return;

    const [, path] = ancestorNode;

    if (editor.api.isAt({ block: true, end: true, start: true })) {
      return api.blockSelection.selectedAll();
    }
    // TODO： should select the blocks then selected all should exclude table and columns
    if (!editor.api.isAt({ block: true })) {
      return api.blockSelection.selectedAll();
    }

    editor.tf.select(path);

    event.preventDefault();
    event.stopPropagation();
  }
  if (isHotkey('escape', event)) {
    if (event.defaultPrevented) return;

    const ancestorNode = editor.api.highestBlock();
    const id = ancestorNode?.[0].id;

    api.blockSelection.addSelectedRow(id as string);

    event.preventDefault();
    event.stopPropagation();
  }
};
