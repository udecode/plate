import { SlatePlugin } from 'slate-react';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions } from './types';

export const HighlightPlugin = ({
  bg,
}: HighlightPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafHighlight({ bg }),
});
