import { Path } from 'slate';
import { TEditor, Value } from '../slate/editor/TEditor';
import { getNode } from '../slate/node/getNode';
import { isText } from '../slate/text/isText';

export const isTextByPath = <V extends Value>(
  editor: TEditor<V>,
  path: Path
) => {
  const node = getNode(editor, path);

  return isText(node);
};
