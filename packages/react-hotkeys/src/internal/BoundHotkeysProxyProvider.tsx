import React, { type ReactNode, createContext, useContext } from 'react';

import type { Hotkey } from './types';

type BoundHotkeysProxyProviderType = {
  addHotkey: (hotkey: Hotkey) => void;
  removeHotkey: (hotkey: Hotkey) => void;
};

const BoundHotkeysProxyProvider = createContext<
  BoundHotkeysProxyProviderType | undefined
>(undefined);

export const useBoundHotkeysProxy = () => {
  return useContext(BoundHotkeysProxyProvider);
};

interface Props {
  addHotkey: (hotkey: Hotkey) => void;
  children: ReactNode;
  removeHotkey: (hotkey: Hotkey) => void;
}

export default function BoundHotkeysProxyProviderProvider({
  addHotkey,
  children,
  removeHotkey,
}: Props) {
  return (
    <BoundHotkeysProxyProvider.Provider value={{ addHotkey, removeHotkey }}>
      {children}
    </BoundHotkeysProxyProvider.Provider>
  );
}
