import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import { TextApi } from '../../interfaces';

/** Check if a node at a location is a Text node */
export const isText = (editor: Editor, at: At) => {
  const node = editor.api.node(at)?.[0];

  return TextApi.isText(node);
};
