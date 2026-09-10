import { createContext } from 'react';

import type { Path, RootKey } from '..';

export { EditorContext } from './hooks/use-editor-context';
export { ComposingContext } from './hooks/use-editor-composing';
export { FocusedContext } from './hooks/use-editor-focused';
export { ReadOnlyContext } from './hooks/use-editor-read-only';
export { ElementContext } from './hooks/use-element';

export const PliteEditableRootContext = createContext<RootKey | null>(null);
export const PliteContentRootOwnerContext = createContext<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
} | null>(null);
export const PliteDOMStrategyVirtualOffsetContext = createContext(0);
