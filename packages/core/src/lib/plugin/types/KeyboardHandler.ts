import type React from 'react';

import type { DOMHandler } from './DOMHandlers';
import type { AnyPluginContext, PluginContext } from './PlatePlugin';

export type KeyboardHandler<C extends AnyPluginContext = PluginContext> =
  DOMHandler<C, React.KeyboardEvent>;
