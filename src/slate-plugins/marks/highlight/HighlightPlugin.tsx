import { SlatePlugin } from 'slate-react';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions } from './types';

export const HighlightPlugin = ({
  style,
}: HighlightPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafHighlight({ style }),
});
