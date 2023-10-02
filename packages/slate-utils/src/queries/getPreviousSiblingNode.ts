import { getNode, TEditor, Value } from '@udecode/slate';
import { last } from 'lodash-es';
import { Path } from 'slate';

export const getPreviousSiblingNode = <V extends Value = Value>(
  editor: TEditor<V>,
  path: Path
) => {
  const index = last(path)!;

  if (index > 0) {
    const previousSiblingIndex = index - 1;
    const previousSiblingPath = path
      .slice(0, -1)
      .concat([previousSiblingIndex]);
    const previousSiblingNode = getNode(editor, previousSiblingPath);

    return previousSiblingNode
      ? [previousSiblingNode, previousSiblingPath]
      : undefined;
  }
};
