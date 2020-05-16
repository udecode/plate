import { SlatePlugin } from 'common/types';
import { deserializeHighlight } from 'marks/highlight/deserializeHighlight';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions } from './types';

export const HighlightPlugin = (
  options: HighlightPluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafHighlight(options),
  deserialize: deserializeHighlight(options),
});
