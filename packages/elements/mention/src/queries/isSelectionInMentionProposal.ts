import { SPEditor } from '@udecode/plate-core';
import { findMentionProposal } from './findMentionProposal';

export const isSelectionInMentionProposal = (editor: SPEditor) =>
  findMentionProposal(editor) !== undefined;
