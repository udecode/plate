import { focusEditorEdge, isEditorFocused } from '@udecode/slate-react';
import { withReact } from 'slate-react';

import type { PlateEditor, WithOverride } from '../../../shared/types';

export const withPlateReact: WithOverride = ({ editor }) => {
  const e = withReact(editor as any) as any as PlateEditor;
  const { reset } = e;

  e.reset = () => {
    const isFocused = isEditorFocused(editor);

    reset();

    if (isFocused) {
      focusEditorEdge(editor, { edge: 'start' });
    }
  };

  return e;
};
