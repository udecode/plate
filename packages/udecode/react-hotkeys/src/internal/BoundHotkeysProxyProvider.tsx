import React, {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';

import type { Hotkey } from './types';

type BoundHotkeysProxyProviderType = {
  addHotkey: (hotkey: Hotkey) => void;
  removeHotkey: (hotkey: Hotkey) => void;
};

const BoundHotkeysProxyProvider = createContext<
  BoundHotkeysProxyProviderType | undefined
>(undefined);

export const useBoundHotkeysProxy = () => useContext(BoundHotkeysProxyProvider);

export default function BoundHotkeysProxyProviderProvider({
  addHotkey,
  children,
  removeHotkey,
}: {
  children: ReactNode;
  addHotkey: (hotkey: Hotkey) => void;
  removeHotkey: (hotkey: Hotkey) => void;
}) {
  // The hotkey listener effect depends on this external registration bridge.
  const value = useMemo(
    () => ({ addHotkey, removeHotkey }),
    [addHotkey, removeHotkey]
  );

  return (
    <BoundHotkeysProxyProvider.Provider value={value}>
      {children}
    </BoundHotkeysProxyProvider.Provider>
  );
}
