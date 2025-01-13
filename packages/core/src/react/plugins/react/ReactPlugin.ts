import { createSlatePlugin } from '../../../lib';
import { withPlateReact } from './withPlateReact';

/** @see {@link withReact} */
export const ReactPlugin = createSlatePlugin({
  key: 'dom',
  extendEditor: withPlateReact,
}).extendEditorTransforms(({ editor }) => {
  const { reset } = editor.tf;

  return {
    reset(options) {
      const isFocused = editor.api.isFocused();

      reset(options);

      if (isFocused) {
        editor.tf.focus({ edge: 'startEditor' });
      }
    },
  };
});
