import { createContext } from 'react';

import type { Editor, NodeKey, RootKey } from '..';
import type { PliteViewBoundaryOwner } from './view-boundary-graph-core';

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
export const PliteEditingAreaContext = createContext<boolean>(false);
export const PliteContentRootOwnerContext =
  createContext<PliteViewBoundaryOwner | null>(null);
export const PliteContentRootInstanceContext =
  createContext<PliteContentRootInstanceContextValue | null>(null);
