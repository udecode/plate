import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types';

import { TextApi } from '../../interfaces';

/** Check if a node at a location is a Text node */
export const isText = (editor: TEditor, at: At) => {
  const node = editor.api.node(at)?.[0];

  return TextApi.isText(node);
};
