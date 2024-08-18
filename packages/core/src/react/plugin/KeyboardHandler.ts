import type React from 'react';

import type { AnyPluginConfig, PluginConfig } from '../../lib';
import type { DOMHandler } from './DOMHandlers';

export type KeyboardHandler<C extends AnyPluginConfig = PluginConfig> =
  DOMHandler<C, React.KeyboardEvent>;
