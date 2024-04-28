import React from 'react';
import { HandlerReturnType } from '@udecode/plate-common';

// TODO: move to core
export type KeyboardEventHandler = (
  event: React.KeyboardEvent
) => HandlerReturnType;
