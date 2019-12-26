import { HighlightPlugin } from 'marks';
import { SlatePlugin } from 'types';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  bg,
}: SearchHighlightPluginOptions = {}): SlatePlugin => ({
  ...HighlightPlugin({ bg }),
});
