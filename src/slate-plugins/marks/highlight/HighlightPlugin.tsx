import { Plugin } from 'slate-react';
import { renderLeafHighlight } from './renderLeafHighlight';
import { RenderLeafHighlightOptions } from './RenderLeafHighlightOptions';

export interface HighlightPluginOptions extends RenderLeafHighlightOptions {}

export const HighlightPlugin = ({
  style,
}: HighlightPluginOptions = {}): Plugin => ({
  renderLeaf: renderLeafHighlight({ style }),
});
