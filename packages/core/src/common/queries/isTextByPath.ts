import {TEditor} from "../../types/slate/TEditor";
import { Node, Path, Text } from 'slate';

export const isTextByPath = (editor: TEditor, path: Path) => {
  const node = Node.get(editor, path);

  return Text.isText(node);
};
