import {
  getPlatePluginOptions,
  PlateEditor,
  PlatePluginOptions,
} from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../defaults';
import { MentionPluginOptions } from '../types';

export const getMentionInputPluginOptions = <T = {}>(
  editor: PlateEditor<T>
): PlatePluginOptions<MentionPluginOptions> =>
  getPlatePluginOptions<MentionPluginOptions>(editor, ELEMENT_MENTION_INPUT);
