import { findNode, FindNodeOptions } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { getMentionInputType } from '../options';

export const findMentionInput = (
  editor: SPEditor,
  options?: Omit<FindNodeOptions, 'match'>
) =>
  findNode(editor, {
    ...options,
    match: { type: getMentionInputType(editor) },
  });
