import { DOMHandler } from './DOMHandlers';

export type KeyboardHandler<T = {}, P = {}> = DOMHandler<'onKeyDown', T, P>;
