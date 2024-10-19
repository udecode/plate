import type { PlateEditor } from '@udecode/plate-common/react';

import { isEditorEmpty, withNewBatch } from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';
import {
  BlockSelectionPlugin,
  removeBlockSelectionNodes,
} from '@udecode/plate-selection/react';
import { cloneDeep } from 'lodash';

import type { AIChatPluginConfig } from '../AIChatPlugin';

export const replaceSelectionAIChat = (
  editor: PlateEditor,
  sourceEditor: PlateEditor
) => {
  if (!sourceEditor || isEditorEmpty(sourceEditor)) return;

  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();

  if (isBlockSelecting) {
    const firstBlockPath = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes()[0][1];

    editor.withoutNormalizing(() => {
      removeBlockSelectionNodes(editor);

      withNewBatch(editor, () => {
        editor
          .getTransforms(BlockSelectionPlugin)
          .blockSelection.insertBlocksAndSelect(
            cloneDeep(sourceEditor.children),
            {
              at: firstBlockPath,
            }
          );
      });
    });
  } else {
    editor.insertFragment(sourceEditor.children);
    focusEditor(editor);
  }
};
