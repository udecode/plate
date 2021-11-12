import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../defaults';

export const getMentionInputType = <T = {}>(editor: PlateEditor<T>): string =>
  getPluginType(editor, ELEMENT_MENTION_INPUT);
