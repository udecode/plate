import { getPlatePluginOptions, SPEditor } from '@udecode/plate-core';
import { ELEMENT_MENTION_PROPOSAL } from '../defaults';
import { MentionPluginOptions } from '../types';
import { PlatePluginOptions } from '@udecode/plate-core/src';

export const getMentionProposalPluginOptions = <T extends SPEditor = SPEditor>(
  editor: T
): PlatePluginOptions<MentionPluginOptions> =>
  getPlatePluginOptions<MentionPluginOptions>(editor, ELEMENT_MENTION_PROPOSAL);
