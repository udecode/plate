import { focusEditorEdge, isEditorFocused } from '@udecode/slate-react';

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
      const isFocused = isEditorFocused(editor);

      reset();

      if (isFocused) {
        focusEditorEdge(editor, { edge: 'start' });
      }
    },
  };
});
