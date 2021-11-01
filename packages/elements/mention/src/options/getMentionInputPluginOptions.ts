import {
  getPlatePluginOptions,
  PlatePluginOptions,
  SPEditor,
} from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../defaults';
import { MentionPluginOptions } from '../types';

export const getMentionInputPluginOptions = <T extends SPEditor = SPEditor>(
  editor: T
): PlatePluginOptions<MentionPluginOptions> =>
  getPlatePluginOptions<MentionPluginOptions>(editor, ELEMENT_MENTION_INPUT);
