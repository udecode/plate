import { KeyboardEvent } from 'react';
import { Value } from '../../slate/editor/TEditor';
import { DOMHandler } from './DOMHandlers';

export type KeyboardHandler<V extends Value, T = {}, P = {}> = DOMHandler<
  V,
  T,
  P,
  KeyboardEvent
>;
