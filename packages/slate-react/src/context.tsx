import { createContext } from 'react';
import type { Path, RootKey, RuntimeId } from '@platejs/slate';
import type { DOMTextSyncOptions } from './dom-text-sync';

export { EditorContext } from './hooks/use-editor';
export { ComposingContext } from './hooks/use-editor-composing';
export { FocusedContext } from './hooks/use-editor-focused';
export { ReadOnlyContext } from './hooks/use-editor-read-only';
export { ElementContext } from './hooks/use-element';

export const ElementPathContext = createContext<Path | null>(null);
export const NodeRuntimeIdContext = createContext<RuntimeId | null>(null);
export const SlateEditableRootContext = createContext<RootKey | null>(null);
export const SlateContentRootOwnerContext = createContext<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
} | null>(null);
export const SlateDOMTextSyncContext = createContext<DOMTextSyncOptions | null>(
  null
);
export const SlateDOMStrategyVirtualOffsetContext = createContext(0);
