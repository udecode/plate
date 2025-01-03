import type { KeyboardHandler } from '@udecode/plate-common/react';

import {
  isHotkey,
  isRangeInSameBlock,
  isSelectionCoverBlock,
} from '@udecode/plate-common';

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

    if (isSelectionCoverBlock(editor)) {
      return api.blockSelection.selectedAll();
    }
    // TODO： should select the blocks then selected all should exclude table and columns
    if (!isRangeInSameBlock(editor)) {
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
