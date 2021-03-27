import { RenderElement } from '../types/SlatePlugin/RenderElement';
import { SPEditor } from '../types/SPEditor';
import { getEditableRenderElement } from './getEditableRenderElement';
import { mapSlatePluginKeysToOptions } from './mapSlatePluginKeysToOptions';

/**
 * Get `renderElement` by plugin key.
 * @see {@link getEditableRenderElement}
 */
export const getRenderElement = (
  pluginKeys: string | string[]
): RenderElement => (editor: SPEditor) =>
  getEditableRenderElement(mapSlatePluginKeysToOptions(editor, pluginKeys));
