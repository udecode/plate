import type React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../PlateEditor';
import type { DOMHandler, DOMHandlerReturnType } from './DOMHandlers';
import type { PluginOptions } from './PlatePlugin';

export type KeyboardHandler<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = DOMHandler<P, V, E, React.KeyboardEvent>;

export type KeyboardHandlerReturnType =
  DOMHandlerReturnType<React.KeyboardEvent>;

export type MouseHandlerReturnType = DOMHandlerReturnType<React.MouseEvent>;
