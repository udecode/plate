import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { ELEMENT_INDENT_TODO, TogglePlugin } from '../types';

export function getEnclosingToggleIds<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(editor: E, elementId: string): string[] {
  const options = getPluginOptions<TogglePlugin, V, E>(
    editor,
    ELEMENT_INDENT_TODO
  );
  return options.toggleIndex?.get(elementId) || [];
}
