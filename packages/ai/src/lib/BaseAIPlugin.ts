import {
  type OmitFirst,
  type PluginConfig,
  type SlateEditor,
  bindFirst,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import {
  acceptAIPreview,
  beginAIPreview,
  cancelAIPreview,
  discardAIPreview,
  hasAIPreview,
} from './transforms/aiStreamSnapshot';
import { removeAIMarks, undoAI } from './transforms';
import { insertAINodes } from './transforms/insertAINodes';
import { removeAINodes } from './transforms/removeAINodes';

export type BaseAIPluginConfig = PluginConfig<
  'ai',
  {},
  {},
  {
    ai: {
      /** Commit the active preview as one fresh undoable batch. */
      acceptPreview: OmitFirst<typeof acceptAIPreview>;
      /** Capture the rollback slice and selection for AI preview. */
      beginPreview: OmitFirst<typeof beginAIPreview>;
      /** Restore the rollback point and clear active preview state. */
      cancelPreview: OmitFirst<typeof cancelAIPreview>;
      /** Clear active preview bookkeeping without restoring content. */
      discardPreview: OmitFirst<typeof discardAIPreview>;
      /** Report whether an AI preview rollback point is active. */
      hasPreview: OmitFirst<typeof hasAIPreview>;
      insertNodes: OmitFirst<typeof insertAINodes>;
      removeMarks: OmitFirst<typeof removeAIMarks>;
      removeNodes: OmitFirst<typeof removeAINodes>;
      undo: OmitFirst<typeof undoAI>;
    };
  }
>;

const getAITransforms = (editor: SlateEditor) => ({
  acceptPreview: bindFirst(acceptAIPreview, editor),
  beginPreview: bindFirst(beginAIPreview, editor),
  cancelPreview: bindFirst(cancelAIPreview, editor),
  discardPreview: bindFirst(discardAIPreview, editor),
  hasPreview: bindFirst(hasAIPreview, editor),
  insertNodes: bindFirst(insertAINodes, editor),
  removeMarks: bindFirst(removeAIMarks, editor),
  removeNodes: bindFirst(removeAINodes, editor),
  undo: bindFirst(undoAI, editor),
});

export const BaseAIPlugin = createTSlatePlugin<BaseAIPluginConfig>({
  key: KEYS.ai,
  node: { isDecoration: false, isLeaf: true },
})
  .extendTransforms(({ editor }) => getAITransforms(editor))
  .extendEditorTransforms<BaseAIPluginConfig['transforms']>(({ editor }) => ({
    ai: getAITransforms(editor),
  }));
