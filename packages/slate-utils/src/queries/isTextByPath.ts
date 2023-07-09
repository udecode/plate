import { TEditor, Value, getNode, isText } from '@udecode/slate';
import { Path } from 'slate';

export const isTextByPath = <V extends Value>(
  editor: TEditor<V>,
  path: Path
) => {
  const node = getNode(editor, path);

  return isText(node);
};
