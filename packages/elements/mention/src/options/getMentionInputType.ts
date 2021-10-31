import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../defaults';

export const getMentionInputType = <T extends SPEditor = SPEditor>(
  editor: T
): string => getPlatePluginType(editor, ELEMENT_MENTION_INPUT);
