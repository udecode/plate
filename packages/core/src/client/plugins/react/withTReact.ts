import { Value } from '@udecode/slate';
import { focusEditorEdge, isEditorFocused } from '@udecode/slate-react';
import { withReact } from 'slate-react';

import { PlateEditor } from '../../../shared/types';

export const withTReact = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const e = withReact(editor as any) as any as E;
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
