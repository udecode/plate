import type React from 'react';

import type { DOMHandler, DOMHandlerReturnType } from './DOMHandlers';

export type KeyboardHandler<O = {}, T = {}, Q = {}, S = {}> = DOMHandler<
  O,
  T,
  Q,
  S,
  React.KeyboardEvent
>;

export type KeyboardHandlerReturnType =
  DOMHandlerReturnType<React.KeyboardEvent>;
