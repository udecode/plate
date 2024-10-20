import type { PlateEditor } from '@udecode/plate-common/react';

import { isEditorEmpty } from '@udecode/plate-common';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import cloneDeep from 'lodash/cloneDeep.js';
import { Path, Range } from 'slate';

import type { AIChatPluginConfig } from '../AIChatPlugin';

export const insertBelowAIChat = (
  editor: PlateEditor,
  sourceEditor: PlateEditor
) => {
  if (!sourceEditor || isEditorEmpty(sourceEditor)) return;

  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();

  const insertBlocksAndSelect =
    editor.getTransforms(BlockSelectionPlugin).blockSelection
      .insertBlocksAndSelect;

  if (isBlockSelecting) {
    const selectedBlocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes();

    const selectedIds = editor.getOptions(BlockSelectionPlugin).selectedIds;

    if (!selectedIds || selectedIds.size === 0) return;

    const lastBlock = selectedBlocks.at(-1);

    if (!lastBlock) return;

    const nextPath = Path.next(lastBlock[1]);

    insertBlocksAndSelect(cloneDeep(sourceEditor.children), {
      at: nextPath,
    });
  } else {
    const [, end] = Range.edges(editor.selection!);
    const endPath = [end.path[0]];

    insertBlocksAndSelect(cloneDeep(sourceEditor.children), {
      at: Path.next(endPath),
    });
  }
};
