import { HighlightPlugin } from 'slate-plugins';
import { SlatePlugin } from 'slate-plugins/types';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  bg,
}: SearchHighlightPluginOptions = {}): SlatePlugin => ({
  ...HighlightPlugin({ bg }),
});
