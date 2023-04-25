import { createPluginFactory } from '../../utils/createPluginFactory';
import { withStagingEditor } from './withStagingEditor';

export const KEY_STAGING = 'staging';

export const createStagingPlugin = createPluginFactory({
  key: KEY_STAGING,
  withOverrides: withStagingEditor,
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
