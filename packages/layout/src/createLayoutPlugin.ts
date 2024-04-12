import { createPluginFactory, HotkeyPlugin } from '@udecode/plate-common';

import { onKeyDownLayout } from './onKeyDownLayout';
import { withLayout } from './withLayout';

export const ELEMENT_LAYOUT = 'layout';
export const ELEMENT_LAYOUT_CHILD = 'layout_child';

export const createLayoutPlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_LAYOUT,
  isElement: true,
  options: {},
  handlers: {
    onKeyDown: onKeyDownLayout,
  },
  plugins: [
    {
      key: ELEMENT_LAYOUT_CHILD,
      isElement: true,
      withOverrides: withLayout,
    },
  ],
});
