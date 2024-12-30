import { type TEditor, getEndPoint, getStartPoint } from '../interfaces';

/** Focus an editor edge. */
export const focusEditorEdge = (
  editor: TEditor,
  {
    edge = 'start',
  }: {
    edge?: 'end' | 'start';
  } = {}
) => {
  const target =
    edge === 'start' ? getStartPoint(editor, []) : getEndPoint(editor, []);

  editor.focus(target);
};
