import {
  findNode,
  FindNodeOptions,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../createMentionPlugin';

export const findMentionInput = <V extends Value>(
  editor: PlateEditor<V>,
  options?: Omit<FindNodeOptions, 'match'>
) =>
  findNode(editor, {
    ...options,
    match: { type: getPluginType(editor, ELEMENT_MENTION_INPUT) },
  });
