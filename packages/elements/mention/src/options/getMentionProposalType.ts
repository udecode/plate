import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_MENTION_PROPOSAL } from '../defaults';

export const getMentionProposalType = <T extends SPEditor = SPEditor>(
  editor: T
): string => getPlatePluginType(editor, ELEMENT_MENTION_PROPOSAL);
