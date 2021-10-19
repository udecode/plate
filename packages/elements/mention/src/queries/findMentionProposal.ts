import { findNode, FindNodeOptions } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { getMentionProposalType } from '../options';

export const findMentionProposal = (
  editor: SPEditor,
  options?: Omit<FindNodeOptions, 'match'>
) =>
  findNode(editor, {
    ...options,
    match: { type: getMentionProposalType(editor) },
  });
