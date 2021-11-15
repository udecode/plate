import { KeyboardEvent } from 'react';
import { DOMHandler } from './DOMHandlers';

export type KeyboardHandler<T = {}, P = {}> = DOMHandler<T, P, KeyboardEvent>;
