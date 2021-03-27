import { RenderLeaf } from '../types/SlatePlugin/RenderLeaf';
import { getEditableRenderLeaf } from './getEditableRenderLeaf';
import { getSlatePluginOptions } from './getSlatePluginOptions';

/**
 * Get `renderLeaf` by plugin key.
 * @see {@link getEditableRenderLeaf}
 */
export const getRenderLeaf = (pluginKey: string): RenderLeaf => (editor) =>
  getEditableRenderLeaf(getSlatePluginOptions(editor, pluginKey));
