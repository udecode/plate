import { RenderLeaf } from '../types/PlatePlugin/RenderLeaf';
import { getEditableRenderLeaf } from './getEditableRenderLeaf';
import { getPlatePluginOptions } from './getPlatePluginOptions';

/**
 * Get `renderLeaf` by plugin key.
 * @see {@link getEditableRenderLeaf}
 */
export const getRenderLeaf = (pluginKey: string): RenderLeaf => (editor) =>
  getEditableRenderLeaf(getPlatePluginOptions(editor, pluginKey));
