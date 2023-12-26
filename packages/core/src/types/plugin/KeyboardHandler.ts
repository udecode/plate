import React from 'react';
import { Value } from '@udecode/slate';

import { PlateEditor } from '../PlateEditor';
import { DOMHandler, DOMHandlerReturnType } from './DOMHandlers';
import { PluginOptions } from './PlatePlugin';

export type KeyboardHandler<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = DOMHandler<P, V, E, React.KeyboardEvent>;

export type KeyboardHandlerReturnType =
  DOMHandlerReturnType<React.KeyboardEvent>;
