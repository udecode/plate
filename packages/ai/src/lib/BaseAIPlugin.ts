import type { Descendant, Location, Path } from '@platejs/plite';
import type { OmitFirst } from '@udecode/utils';
import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

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
import { aiBatchField } from './transforms/withAIBatch';

export type BaseAIPluginConfig = PluginConfig<
  'ai',
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
      undo: OmitFirst<typeof undoAI>;
    };
  },
  {
    ai: {
      insertNodes: (nodes: Descendant[], options?: { target?: Path }) => void;
      removeMarks: (options?: { at?: Location }) => void;
      removeNodes: (options?: { at?: Path }) => void;
    };
  }
>;

export const BaseAIPlugin = createBasePlugin<BaseAIPluginConfig>({
  key: KEYS.ai,
  node: { isDecoration: false, isLeaf: true },
})
  .extendExtension(aiBatchField)
  .extendApi<BaseAIPluginConfig['api']['ai']>(({ editor }) => ({
    acceptPreview: (value) => acceptAIPreview(editor, value),
    beginPreview: (options) => beginAIPreview(editor, options),
    cancelPreview: () => cancelAIPreview(editor),
    discardPreview: () => discardAIPreview(editor),
    hasPreview: () => hasAIPreview(editor),
    undo: () => undoAI(editor),
  }))
  .extendTx(({ editor }) => (tx) => ({
    insertNodes: (nodes, options) => insertAINodes(editor, tx, nodes, options),
    removeMarks: (options) => removeAIMarks(editor, tx, options),
    removeNodes: (options) => removeAINodes(editor, tx, options),
  }));
