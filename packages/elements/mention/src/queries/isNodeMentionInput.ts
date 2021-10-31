import { SPEditor, TDescendant, TElement } from '@udecode/plate-core';
import { getMentionInputType } from '../options';

export const isNodeMentionInput = (
  editor: SPEditor,
  node: TDescendant
): node is TElement<{ trigger: string }> =>
  node.type === getMentionInputType(editor);
