import { HighlightPlugin } from 'slate-plugins/marks/highlight';
import { SlatePlugin } from 'slate-react';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  bg,
}: SearchHighlightPluginOptions = {}): SlatePlugin => ({
  ...HighlightPlugin({ bg }),
});
