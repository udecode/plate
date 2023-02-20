import { createPluginFactory } from '../../utils/plate/createPluginFactory';
import { withNormalizeNode } from './withNormalizeNode';

export const KEY_NORMALIZE = 'normalize';

export const createNormalizePlugin = createPluginFactory({
  key: KEY_NORMALIZE,
  withOverrides: withNormalizeNode,
  // editor: {
  //   normalizeNode: (editor) => ({
  //     maxIterations: 2,
  //     apply: (entry) => {
  //       editor.insertText('.');
  //       return true;
  //     },
  //   }),
  // },
});
