import { focusEditorEdge, isEditorFocused } from '@udecode/slate-react';

import { createPlugin } from '../../../lib';
import { withPlateReact } from './withPlateReact';

/** @see {@link withReact} */
export const ReactPlugin = createPlugin({
  key: 'dom',
  withOverrides: withPlateReact,
}).extendApi(({ editor }) => {
  const { reset } = editor.api;

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
