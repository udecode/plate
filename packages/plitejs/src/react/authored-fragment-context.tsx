import { createContext, type ReactNode } from 'react';

import type { NativeAuthoredFragment } from '../core/authored-runtime';
import type { AnyEditor, NodeKey } from '../interfaces/editor';

export const AuthoredFragmentRootsContext = createContext<{
  parent: AnyEditor;
  roots: ReadonlyMap<NodeKey, boolean>;
} | null>(null);

export const AuthoredFragmentRendererContext = createContext<
  ((fragment: NativeAuthoredFragment) => ReactNode) | null
>(null);
