import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common/server';

import { ELEMENT_TOGGLE, TogglePlugin } from '../types';

export function getEnclosingToggleIds<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(editor: E, elementId: string): string[] {
  const options = getPluginOptions<TogglePlugin, V, E>(editor, ELEMENT_TOGGLE);
  return options.toggleIndex?.get(elementId) || [];
}
