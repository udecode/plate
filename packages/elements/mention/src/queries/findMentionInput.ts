import { findNode, FindNodeOptions } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { getMentionInputType } from '../options';

export const findMentionInput = (
  editor: PlateEditor,
  options?: Omit<FindNodeOptions, 'match'>
) =>
  findNode(editor, {
    ...options,
    match: { type: getMentionInputType(editor) },
  });
