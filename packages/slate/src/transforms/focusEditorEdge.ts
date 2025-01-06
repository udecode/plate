import type { Editor } from '../interfaces';

/** Focus an editor edge. */
export const focusEditorEdge = (
  editor: Editor,
  {
    edge = 'start',
  }: {
    edge?: 'end' | 'start';
  } = {}
) => {
  const target = edge === 'start' ? editor.api.start([]) : editor.api.end([]);

  editor.tf.focus(target);
};
