import type { LengthConfig } from '../getCorePlugins';

import { createEditorPlugin } from '../../plugin';

export const LengthPlugin = Object.assign(
  createEditorPlugin<LengthConfig>({
    key: 'length',
  }),
  {
    runtimeLength: true,
  }
);
