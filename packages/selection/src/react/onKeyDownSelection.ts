import type { KeyboardHandler } from '@udecode/plate-common/react';

import {
  getAncestorNode,
  isHotkey,
  isRangeInSameBlock,
  isSelectionCoverBlock,
  select,
} from '@udecode/plate-common';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

export const onKeyDownSelection: KeyboardHandler<BlockSelectionConfig> = ({
  api,
  editor,
  event,
}) => {
  if (isHotkey('mod+a', event)) {
    const ancestorNode = getAncestorNode(editor);

    if (!ancestorNode) return;

    const [, path] = ancestorNode;

    if (isSelectionCoverBlock(editor)) {
      return api.blockSelection.selectedAll();
    }
    // TODO： should select the blocks then selected all should exclude table and columns
    if (!isRangeInSameBlock(editor)) {
      return api.blockSelection.selectedAll();
    }

    select(editor, path);

    event.preventDefault();
    event.stopPropagation();
  }
  if (isHotkey('escape', event)) {
    const ancestorNode = getAncestorNode(editor);
    const id = ancestorNode?.[0].id;

    api.blockSelection.addSelectedRow(id);

    event.preventDefault();
    event.stopPropagation();
  }
};
