import {
  type PlatePlugin,
  extendPlugin,
  onKeyDownToggleElement,
} from '@udecode/plate-common/react';

import { HeadingPlugin as BaseHeadingPlugin } from '../lib/HeadingPlugin';

export const HeadingPlugin = extendPlugin(BaseHeadingPlugin, ({ plugin }) => ({
  plugins: (plugin as unknown as PlatePlugin).plugins.map((p) => ({
    ...p,
    handlers: { onKeyDown: onKeyDownToggleElement },
  })),
}));
