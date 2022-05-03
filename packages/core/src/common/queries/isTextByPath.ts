import { Path } from 'slate';
import { getNodeNode } from '../../slate/node/getNodeNode';
import { isText } from '../../slate/text/isText';
import { TEditor, Value } from '../../slate/types/TEditor';

export const isTextByPath = <V extends Value>(
  editor: TEditor<V>,
  path: Path
) => {
  const node = getNodeNode(editor, path);

  return isText(node);
};
