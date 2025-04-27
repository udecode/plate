import { DOMPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';
import { withPlateReact } from './withPlateReact';

/** @see {@link withReact} */
export const ReactPlugin = toPlatePlugin(DOMPlugin, {
  key: 'dom',
  extendEditor: withPlateReact as any,
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
