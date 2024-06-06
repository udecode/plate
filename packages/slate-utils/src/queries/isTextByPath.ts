import type { Path } from 'slate';

import { type TEditor, type Value, getNode, isText } from '@udecode/slate';

export const isTextByPath = <V extends Value>(
  editor: TEditor<V>,
  path: Path
) => {
  const node = getNode(editor, path);

  return isText(node);
};
