import { PlateEditor, TDescendant } from '@udecode/plate-core';
import { getMentionInputType } from '../options';
import { MentionInputNode } from '../types';

export const isNodeMentionInput = (
  editor: PlateEditor,
  node: TDescendant
): node is MentionInputNode => node.type === getMentionInputType(editor);
