import { type OmitFirst, bindFirst } from '@udecode/utils';

import { type PluginConfig, createSlatePlugin } from '../../plugin';
import { init } from './transforms/init';
import { insertExitBreak } from './transforms/insertExitBreak';
import { resetBlock } from './transforms/resetBlock';
import { setValue } from './transforms/setValue';

export type SlateExtensionConfig = PluginConfig<
  'slateExtension',
  {},
  {},
  {
    init: OmitFirst<typeof init>;
    insertExitBreak: OmitFirst<typeof insertExitBreak>;
    resetBlock: OmitFirst<typeof resetBlock>;
    setValue: OmitFirst<typeof setValue>;
  }
>;

/** Opinionated extension of slate default behavior. */
export const SlateExtensionPlugin = createSlatePlugin({
  key: 'slateExtension',
}).extendEditorTransforms(({ editor }) => ({
  /**
   * Initialize the editor value, selection and normalization. Set `value` to
   * `null` to skip children initialization.
   */
  init: bindFirst(init, editor),
  insertExitBreak: bindFirst(insertExitBreak, editor),
  resetBlock: bindFirst(resetBlock, editor),
  setValue: bindFirst(setValue, editor),
}));
