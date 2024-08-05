import type React from 'react';

import type { DOMHandler } from './DOMHandlers';

export type KeyboardHandler<O = {}, A = {}, T = {}, S = {}> = DOMHandler<
  O,
  A,
  T,
  S,
  React.KeyboardEvent
>;
