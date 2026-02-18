import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import BoundHotkeysProxyProviderProvider from './BoundHotkeysProxyProvider';
import deepEqual from './deepEqual';
import type { Hotkey } from './types';

export type HotkeysContextType = {
  activeScopes: string[];
  hotkeys: readonly Hotkey[];
  disableScope: (scope: string) => void;
  enableScope: (scope: string) => void;
  toggleScope: (scope: string) => void;
};

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  activeScopes: [], // This array has to be empty instead of containing '*' as default, to check if the provider is set or not
  hotkeys: [],
  disableScope: () => {},
  enableScope: () => {},
  toggleScope: () => {},
});

export const useHotkeysContext = () => useContext(HotkeysContext);

type Props = {
  children: ReactNode;
  initiallyActiveScopes?: string[];
};

export const HotkeysProvider = ({
  children,
  initiallyActiveScopes = ['*'],
}: Props) => {
  const [internalActiveScopes, setInternalActiveScopes] = useState(
    initiallyActiveScopes
  );
  const [boundHotkeys, setBoundHotkeys] = useState<Hotkey[]>([]);

  const enableScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => {
      if (prev.includes('*')) {
        return [scope];
      }

      return Array.from(new Set([scope, ...prev]));
    });
  }, []);

  const disableScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => prev.filter((s) => s !== scope));
  }, []);

  const toggleScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => {
      if (prev.includes(scope)) {
        return prev.filter((s) => s !== scope);
      }
      if (prev.includes('*')) {
        return [scope];
      }

      return Array.from(new Set([scope, ...prev]));
    });
  }, []);

  const addBoundHotkey = useCallback((hotkey: Hotkey) => {
    setBoundHotkeys((prev) => [...prev, hotkey]);
  }, []);

  const removeBoundHotkey = useCallback((hotkey: Hotkey) => {
    setBoundHotkeys((prev) => prev.filter((h) => !deepEqual(h, hotkey)));
  }, []);

  return (
    <HotkeysContext.Provider
      value={{
        activeScopes: internalActiveScopes,
        disableScope,
        enableScope,
        hotkeys: boundHotkeys,
        toggleScope,
      }}
    >
      <BoundHotkeysProxyProviderProvider
        addHotkey={addBoundHotkey}
        removeHotkey={removeBoundHotkey}
      >
        {children}
      </BoundHotkeysProxyProviderProvider>
    </HotkeysContext.Provider>
  );
};
