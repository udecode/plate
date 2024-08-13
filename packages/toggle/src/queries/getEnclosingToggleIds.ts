import { type PlateEditor, getPluginOptions } from '@udecode/plate-common';

import type { TogglePluginOptions } from '../types';

import { TogglePlugin } from '../TogglePlugin';

export function getEnclosingToggleIds(
  editor: PlateEditor,
  elementId: string
): string[] {
  const options = getPluginOptions<TogglePluginOptions>(
    editor,
    TogglePlugin.key
  );

  return options.toggleIndex?.get(elementId) || [];
}
