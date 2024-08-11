import {
  type PlateEditor,
  getPluginOptions,
} from '@udecode/plate-common/server';

import { ELEMENT_TOGGLE, type TogglePluginOptions } from '../types';

export function getEnclosingToggleIds(
  editor: PlateEditor,
  elementId: string
): string[] {
  const options = getPluginOptions<TogglePluginOptions>(editor, ELEMENT_TOGGLE);

  return options.toggleIndex?.get(elementId) || [];
}
