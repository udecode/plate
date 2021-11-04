import { RenderElement } from '../types/PlatePlugin/RenderElement';
import { PlateEditor } from '../types/SPEditor';
import { getEditableRenderElement } from './getEditableRenderElement';
import { mapPlatePluginKeysToOptions } from './mapPlatePluginKeysToOptions';

/**
 * Get `renderElement` by plugin key.
 * @see {@link getEditableRenderElement}
 */
export const getRenderElement = (
  pluginKeys: string | string[]
): RenderElement => (editor: PlateEditor) =>
  getEditableRenderElement(mapPlatePluginKeysToOptions(editor, pluginKeys));
