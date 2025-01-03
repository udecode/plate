import type { Path } from 'slate';

import { type TEditor, getNode, isText } from '../interfaces';

export const isTextByPath = (editor: TEditor, path: Path) => {
  const node = getNode(editor, path);

  return isText(node);
};