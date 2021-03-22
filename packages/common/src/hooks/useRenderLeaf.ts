import { getPluginOptions, RenderLeaf } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { getRenderLeaf } from '../utils/getRenderLeaf';

export const useRenderLeaf = (pluginKey: string): RenderLeaf => (
  editor: Editor
) => getRenderLeaf(getPluginOptions(editor, pluginKey));
