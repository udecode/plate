import { TEditor } from '@udecode/slate-plugins-core';
import { Node, Path, Text } from 'slate';

export const isTextByPath = (editor: TEditor, path: Path) => {
  const node = Node.get(editor, path);

  return Text.isText(node);
};
