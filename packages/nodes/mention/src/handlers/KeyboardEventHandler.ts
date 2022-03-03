import { KeyboardEvent } from 'react';
import { HandlerReturnType } from '@udecode/plate-core';

// TODO: move to core
export type KeyboardEventHandler = (event: KeyboardEvent) => HandlerReturnType;
