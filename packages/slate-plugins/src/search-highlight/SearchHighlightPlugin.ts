import { SlatePlugin } from 'common/types';
import { HighlightPlugin } from 'marks';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  bg,
}: SearchHighlightPluginOptions = {}): SlatePlugin => ({
  ...HighlightPlugin({ bg }),
});
