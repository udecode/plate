import { Node, Path, Text } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

export const isTextByPath = (editor: TEditor, path: Path) => {
  const node = Node.get(editor, path);

  return Text.isText(node);
};
