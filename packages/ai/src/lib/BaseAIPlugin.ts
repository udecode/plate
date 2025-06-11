import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import { removeAIMarks, undoAI } from './transforms';
import { insertAINodes } from './transforms/insertAINodes';
import { removeAINodes } from './transforms/removeAINodes';

export type BaseAIPluginConfig = PluginConfig<
  'ai',
  {},
  {},
  {
    ai: {
      insertNodes: OmitFirst<typeof insertAINodes>;
      removeMarks: OmitFirst<typeof removeAIMarks>;
      removeNodes: OmitFirst<typeof removeAINodes>;
    };
  }
>;

export const BaseAIPlugin = createTSlatePlugin({
  key: KEYS.ai,
  node: { isDecoration: false, isLeaf: true },
}).extendTransforms(({ editor }) => ({
  insertNodes: bindFirst(insertAINodes, editor),
  removeMarks: bindFirst(removeAIMarks, editor),
  removeNodes: bindFirst(removeAINodes, editor),
  undo: bindFirst(undoAI, editor),
}));
