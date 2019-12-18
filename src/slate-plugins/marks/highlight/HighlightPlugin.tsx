import { Plugin } from 'slate-react';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions } from './types';

export const HighlightPlugin = ({
  style,
}: HighlightPluginOptions = {}): Plugin => ({
  renderLeaf: renderLeafHighlight({ style }),
});
