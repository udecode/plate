import {
  findNode,
  FindNodeOptions,
  getPluginType,
  PlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../createMentionPlugin';

export const findMentionInput = (
  editor: PlateEditor,
  options?: Omit<FindNodeOptions, 'match'>
) =>
  findNode(editor, {
    ...options,
    match: { type: getPluginType(editor, ELEMENT_MENTION_INPUT) },
  });
