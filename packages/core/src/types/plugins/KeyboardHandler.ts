import { KeyboardEvent } from 'react';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../PlateEditor';
import { DOMHandler } from './DOMHandlers';
import { PluginOptions } from './PlatePlugin';

export type KeyboardHandler<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = DOMHandler<P, V, E, KeyboardEvent>;
