import {
  getPlatePluginOptions,
  PlatePluginOptions,
  SPEditor,
} from '@udecode/plate-core';
import { ELEMENT_MENTION_PROPOSAL } from '../defaults';

export const getMentionProposalPluginOptions = <T extends SPEditor = SPEditor>(
  editor: T
): PlatePluginOptions =>
  getPlatePluginOptions(editor, ELEMENT_MENTION_PROPOSAL);
