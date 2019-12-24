import { SlatePlugin } from 'slate-plugins/types';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions } from './types';

export const HighlightPlugin = ({
  bg,
}: HighlightPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafHighlight({ bg }),
});
