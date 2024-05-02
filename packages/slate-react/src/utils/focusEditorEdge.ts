import { type Value, getEndPoint, getStartPoint } from '@udecode/slate';

import type { TReactEditor } from '../types/index';

import { focusEditor } from '../react-editor/index';

/** Focus an editor edge. */
export const focusEditorEdge = <V extends Value>(
  editor: TReactEditor<V>,
  {
    edge = 'start',
  }: {
    edge?: 'end' | 'start';
  } = {}
) => {
  const target =
    edge === 'start' ? getStartPoint(editor, []) : getEndPoint(editor, []);

  focusEditor(editor, target);
};
