import {
  findNode,
  FindNodeOptions,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_SLASH_INPUT } from '../createSlashPlugin';
import { TSlashInputElement } from '../types';

export const findSlashInput = <V extends Value>(
  editor: PlateEditor<V>,
  options?: Omit<FindNodeOptions<V>, 'match'>
) =>
  findNode<TSlashInputElement>(editor, {
    ...options,
    match: { type: getPluginType(editor, ELEMENT_SLASH_INPUT) },
  });
