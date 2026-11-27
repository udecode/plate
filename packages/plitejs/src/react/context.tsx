import { createContext } from 'react';

import type { Editor, NodeKey, Path, RootKey } from '..';

export { EditorContext } from './hooks/use-editor-context';
export { ComposingContext } from './hooks/use-editor-composing';
export { FocusedContext } from './hooks/use-editor-focused';
export { ReadOnlyContext } from './hooks/use-editor-read-only';
export { ElementContext } from './hooks/use-element';

export type ContentRootInstanceHop = Readonly<{
  ownerKey: NodeKey;
  ownerRoot: RootKey;
  root: RootKey;
  slot: string;
  slotMountId: string;
}>;

export type PliteContentRootInstanceContextValue = Readonly<{
  childRoot: RootKey;
  hops: readonly ContentRootInstanceHop[];
  instanceKey: string;
  paneKey: string;
  runtimeOwner: Editor;
}>;

export const PliteEditableRootContext = createContext<RootKey | null>(null);
export const PliteContentRootOwnerContext = createContext<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
} | null>(null);
export const PliteContentRootInstanceContext =
  createContext<PliteContentRootInstanceContextValue | null>(null);
