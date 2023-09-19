import { getEndPoint, getStartPoint, Value } from '@udecode/slate';

import { focusEditor } from '../react-editor/index';
import { TReactEditor } from '../types/index';

/**
 * Focus an editor edge.
 */
export const focusEditorEdge = <V extends Value>(
  editor: TReactEditor<V>,
  {
    edge = 'start',
  }: {
    edge?: 'start' | 'end';
  } = {}
) => {
  const target =
    edge === 'start' ? getStartPoint(editor, []) : getEndPoint(editor, []);

  focusEditor(editor, target);
};
