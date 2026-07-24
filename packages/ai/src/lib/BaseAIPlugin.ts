import {
  type Descendant,
  type Location,
  type Path,
  property,
  schema,
  target,
} from '@platejs/plite';
import type { OmitFirst } from '@udecode/utils';
import {
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  AI_PREVIEW_KEY,
  acceptAIPreview,
  beginAIPreview,
  cancelAIPreview,
  discardAIPreview,
  hasAIPreview,
} from './transforms/aiStreamSnapshot';
import { removeAIMarks, undoAI } from './transforms';
import { insertAINodes } from './transforms/insertAINodes';
import { removeAINodes } from './transforms/removeAINodes';
import { aiBatchEffectExtension, aiBatchField } from './transforms/withAIBatch';

type BaseAIContract = PluginConfig<
  'ai',
  {},
  {},
  {
    ai: {
      insertNodes: (nodes: Descendant[], options?: { target?: Path }) => void;
      removeMarks: (options?: { at?: Location }) => void;
      removeNodes: (options?: { at?: Path }) => void;
    };
  },
  {},
  {},
  readonly [],
  never,
  {
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
  }
>;

export const BaseAIPlugin = createBasePlugin({
  key: KEYS.ai,
  render: { isDecoration: false },
  rules: { selection: { affinity: 'outward' } },
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
    properties: [
      schema.elementProperty(AI_PREVIEW_KEY, property.boolean(), {
        split: 'preserve',
        target: target.group('block'),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  },
})
  .extendExtension([aiBatchField, aiBatchEffectExtension])
  .extendApi<BaseAIContract['pluginApi']>(({ editor }) => ({
    acceptPreview: (value) => acceptAIPreview(editor, value),
    beginPreview: (options) => beginAIPreview(editor, options),
    cancelPreview: () => cancelAIPreview(editor),
    discardPreview: () => discardAIPreview(editor),
    hasPreview: () => hasAIPreview(editor),
    undo: () => undoAI(editor),
  }))
  .extendTx<BaseAIContract['tx']['ai']>(({ editor }) => (tx) => ({
    insertNodes: (nodes, options = {}) =>
      insertAINodes(editor, tx, nodes, options),
    removeMarks: (options = {}) => removeAIMarks(editor, tx, options),
    removeNodes: (options = {}) => removeAINodes(editor, tx, options),
  }));

export type BaseAIPluginConfig = InferConfig<typeof BaseAIPlugin>;
