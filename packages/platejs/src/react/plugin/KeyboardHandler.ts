import type React from 'react';

import type { AnyBasePluginDefinition, BasePluginDefinition } from '../../lib';
import type { DOMHandler } from './DOMHandlers';

export type KeyboardHandler<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = DOMHandler<C, React.KeyboardEvent>;
