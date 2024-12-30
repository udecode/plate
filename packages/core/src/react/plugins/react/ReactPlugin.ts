import { focusEditorEdge } from '@udecode/slate';

import { createSlatePlugin } from '../../../lib';
import { withPlateReact } from './withPlateReact';

/** @see {@link withReact} */
export const ReactPlugin = createSlatePlugin({
  key: 'dom',
  extendEditor: withPlateReact,
}).extendEditorTransforms(({ editor }) => {
  const { reset } = editor.tf;

  return {
    reset: () => {
      const isFocused = editor.isFocused();

      reset();

      if (isFocused) {
        focusEditorEdge(editor, { edge: 'start' });
      }
    },
  };
});
