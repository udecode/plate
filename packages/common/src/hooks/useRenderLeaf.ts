import { useEditorPluginOptions } from '@udecode/slate-plugins-core';
import { getRenderLeaf } from '../utils/getRenderLeaf';

export const useRenderLeaf = (pluginKey: string) =>
  getRenderLeaf(useEditorPluginOptions(pluginKey));
