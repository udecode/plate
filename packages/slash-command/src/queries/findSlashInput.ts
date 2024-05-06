import {
  type FindNodeOptions,
  type PlateEditor,
  type Value,
  findNode,
  getPluginType,
} from '@udecode/plate-common';

import type { TSlashInputElement } from '../types';

import { ELEMENT_SLASH_INPUT } from '../createSlashPlugin';

export const findSlashInput = <V extends Value>(
  editor: PlateEditor<V>,
  options?: Omit<FindNodeOptions<V>, 'match'>
) =>
  findNode<TSlashInputElement>(editor, {
    ...options,
    match: { type: getPluginType(editor, ELEMENT_SLASH_INPUT) },
  });
