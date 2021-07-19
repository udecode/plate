import { RenderElement } from '../types/PlatePlugin/RenderElement';
import { SPEditor } from '../types/SPEditor';
import { getEditableRenderElement } from './getEditableRenderElement';
import { mapPlatePluginKeysToOptions } from './mapPlatePluginKeysToOptions';

/**
 * Get `renderElement` by plugin key.
 * @see {@link getEditableRenderElement}
 */
export const getRenderElement = (
  pluginKeys: string | string[]
): RenderElement => (editor: SPEditor) =>
  getEditableRenderElement(mapPlatePluginKeysToOptions(editor, pluginKeys));
