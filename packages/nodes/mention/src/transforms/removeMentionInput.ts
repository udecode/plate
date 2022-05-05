import {
  insertText,
  PlateEditor,
  TDescendant,
  unwrapNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Node, Path } from 'slate';

export const removeMentionInput = <V extends Value>(
  editor: PlateEditor<V>,
  path: Path
) =>
  withoutNormalizing(editor, () => {
    const { trigger } = Node.get(editor, path) as TDescendant;

    insertText(editor, trigger, {
      at: { path: [...path, 0], offset: 0 },
    });
    unwrapNodes(editor, {
      at: path,
    });
  });
