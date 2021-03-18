import { getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { getRenderLeaf } from './getRenderLeaf';

export const getPluginRenderLeaf = (pluginKey: string) => (editor: Editor) =>
  getRenderLeaf(getPluginOptions(editor, pluginKey));
