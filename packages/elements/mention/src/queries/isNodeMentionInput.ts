import { SPEditor, TDescendant } from '@udecode/plate-core';
import { getMentionInputType } from '../options';

export const isNodeMentionInput = (
  editor: SPEditor,
  node: TDescendant
): boolean => node.type === getMentionInputType(editor);
