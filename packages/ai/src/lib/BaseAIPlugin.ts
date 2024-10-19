import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { removeAIMarks } from './transforms';
import { insertAINodes } from './transforms/insertAINodes';
import { removeAINodes } from './transforms/removeAINodes';

type BaseAIOptions = {};
type BaseAITransforms = {
  insertNodes: OmitFirst<typeof insertAINodes>;
  removeMarks: OmitFirst<typeof removeAIMarks>;
  removeNodes: OmitFirst<typeof removeAINodes>;
};

export type BaseAIPluginConfig = PluginConfig<
  'ai',
  BaseAIOptions,
  {},
  { ai: BaseAITransforms }
>;

export const BaseAIPlugin = createTSlatePlugin({
  key: 'ai',
  node: { isLeaf: true },
})
  .extendTransforms(({ editor }) => ({
    insertNodes: bindFirst(insertAINodes, editor),
    removeMarks: bindFirst(removeAIMarks, editor),
    removeNodes: bindFirst(removeAINodes, editor),
  }))
  .extend({
    extendEditor: ({ editor }) => {
      const { apply } = editor;

      editor.apply = (op) => {
        // console.log('🚀 ~ editor.apply= ~ op:', op);
        // console.log('history', editor.history.undos);
        apply(op);
      };

      return editor;
    },
  });
