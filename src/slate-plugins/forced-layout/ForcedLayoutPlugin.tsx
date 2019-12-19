import { SlatePlugin } from 'slate-react';
import { withLayout } from './withLayout';

export const ForcedLayoutPlugin = (): SlatePlugin => ({
  editor: withLayout,
});
