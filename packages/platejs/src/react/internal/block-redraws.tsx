import React from 'react';

import type { NodeKey, Path } from '../../facade';
import type { Editor } from '../editor/Editor';

type Redraws = Readonly<{
  listeners: Map<NodeKey, Set<() => void>>;
  versions: Map<NodeKey, number>;
}>;

const REDRAWS = new WeakMap<Editor, Redraws>();

const BlockRedrawContext = React.createContext(0);

const subscribeNothing = () => () => {};
const noVersion = () => 0;

export const redrawBlocks = (view: Editor, keys: readonly NodeKey[]) => {
  const redraws = REDRAWS.get(view);

  if (!redraws) return;
  for (const key of keys) {
    const listeners = redraws.listeners.get(key);

    if (!listeners) continue;
    redraws.versions.set(key, (redraws.versions.get(key) ?? 0) + 1);
    listeners.forEach((listener) => listener());
  }
};

const subscribe = (view: Editor, key: NodeKey, listener: () => void) => {
  let redraws = REDRAWS.get(view);

  if (!redraws) {
    redraws = { listeners: new Map(), versions: new Map() };
    REDRAWS.set(view, redraws);
  }

  const listeners = redraws.listeners.get(key) ?? new Set<() => void>();

  listeners.add(listener);
  redraws.listeners.set(key, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && redraws.listeners.get(key) === listeners) {
      redraws.listeners.delete(key);
      redraws.versions.delete(key);
    }
  };
};

export const useBlockRedraw = (view: Editor, path: Path) => {
  const key = path.length === 1 ? view.key(path) : null;
  const subscribeBlock = React.useCallback(
    (listener: () => void) =>
      key === null ? subscribeNothing() : subscribe(view, key, listener),
    [key, view]
  );
  const readVersion = React.useCallback(
    () => (key === null ? 0 : (REDRAWS.get(view)?.versions.get(key) ?? 0)),
    [key, view]
  );
  const version = React.useSyncExternalStore(
    subscribeBlock,
    readVersion,
    noVersion
  );

  return key === null ? null : version;
};

export function BlockRedraw({
  children,
  version,
}: {
  children: React.ReactNode;
  version: number;
}) {
  return <BlockRedrawContext value={version}>{children}</BlockRedrawContext>;
}

export const useRedrawWithBlock = () => {
  React.useContext(BlockRedrawContext);
};
