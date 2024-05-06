import {
  type HotkeyPlugin,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { onKeyDownColumn } from './onKeyDownColumn';
import { withColumn } from './withColumn';

export const ELEMENT_COLUMN_GROUP = 'column_group';

export const ELEMENT_COLUMN = 'column';

export const createColumnPlugin = createPluginFactory<HotkeyPlugin>({
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  isElement: true,
  key: ELEMENT_COLUMN_GROUP,
  options: {},
  plugins: [
    {
      isElement: true,
      key: ELEMENT_COLUMN,
      withOverrides: withColumn,
    },
  ],
});
