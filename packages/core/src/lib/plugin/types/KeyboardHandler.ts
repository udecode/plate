import type React from 'react';

import type { DOMHandler } from './DOMHandlers';
import type { AnyPluginConfig, PluginConfig } from './PlatePlugin';

export type KeyboardHandler<C extends AnyPluginConfig = PluginConfig> =
  DOMHandler<C, React.KeyboardEvent>;
