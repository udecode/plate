import type { SlateEditor } from 'platejs';

import { getFootnoteDefinition } from '../queries/getFootnoteDefinition';

export const focusFootnoteDefinition = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => {
  const definition = getFootnoteDefinition(editor, { identifier });

  if (!definition) return false;

  const firstTextPath = definition[1].concat([0, 0]);
  const point = editor.api.start(firstTextPath);

  if (!point) return false;

  return editor.tf.navigation.navigate({
    focus: true,
    scroll: true,
    scrollTarget: point,
    select: {
      anchor: { offset: 0, path: firstTextPath },
      focus: { offset: 0, path: firstTextPath },
    },
    target: {
      path: definition[1],
      type: 'node',
    },
  });
};
