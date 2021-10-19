import { SPEditor, TDescendant } from '@udecode/plate-core';
import { getMentionProposalType } from '../options';

export const isNodeMentionProposal = (
  editor: SPEditor,
  node: TDescendant
): boolean => node.type === getMentionProposalType(editor);
