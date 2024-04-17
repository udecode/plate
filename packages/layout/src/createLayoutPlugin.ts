import { createPluginFactory, HotkeyPlugin } from '@udecode/plate-common';

import { onKeyDownColumn } from './onKeyDownColumn';
import { withColumn } from './withColumn';

export const ELEMENT_COLUMN_GROUP = 'column_group';
export const ELEMENT_COLUMN = 'column';

export const createLayoutPlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_COLUMN_GROUP,
  isElement: true,
  options: {},
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  plugins: [
    {
      key: ELEMENT_COLUMN,
      isElement: true,
      withOverrides: withColumn,
    },
  ],
});
