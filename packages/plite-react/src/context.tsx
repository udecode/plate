import type { Path, RootKey, NodeKey } from '@platejs/plite';
import { createContext } from 'react';

export { EditorContext } from './hooks/use-editor';
export { ComposingContext } from './hooks/use-editor-composing';
export { FocusedContext } from './hooks/use-editor-focused';
export { ReadOnlyContext } from './hooks/use-editor-read-only';
export { ElementContext } from './hooks/use-element';

export const ElementPathContext = createContext<Path | null>(null);
export const NodeKeyContext = createContext<NodeKey | null>(null);
export const PliteEditableRootContext = createContext<RootKey | null>(null);
export const PliteContentRootOwnerContext = createContext<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
} | null>(null);
export const PliteDOMStrategyVirtualOffsetContext = createContext(0);
