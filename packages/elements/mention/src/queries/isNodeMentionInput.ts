import { PlateEditor, TDescendant, TElement } from '@udecode/plate-core';
import { getMentionInputType } from '../options';

export const isNodeMentionInput = (
  editor: PlateEditor,
  node: TDescendant
): node is TElement<{ trigger: string }> =>
  node.type === getMentionInputType(editor);
