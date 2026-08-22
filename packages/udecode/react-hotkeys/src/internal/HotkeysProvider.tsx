import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import BoundHotkeysProxyProviderProvider from './BoundHotkeysProxyProvider';
import deepEqual from './deepEqual';
import type { Hotkey } from './types';

const DEFAULT_ACTIVE_SCOPES = ['*'];

export type HotkeysContextType = {
  activeScopes: string[];
  hotkeys: readonly Hotkey[];
  disableScope: (scope: string) => void;
  enableScope: (scope: string) => void;
  toggleScope: (scope: string) => void;
};

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  // This array has to be empty instead of containing '*' as default, to check if the provider is set or not
  activeScopes: [],
  hotkeys: [],
  disableScope: () => {},
  enableScope: () => {},
  toggleScope: () => {},
});

export const useHotkeysContext = () => useContext(HotkeysContext);

export const HotkeysProvider = ({
  children,
  initiallyActiveScopes = DEFAULT_ACTIVE_SCOPES,
}: {
  children: ReactNode;
  initiallyActiveScopes?: string[];
}) => {
  const [internalActiveScopes, setInternalActiveScopes] = useState(
    initiallyActiveScopes
  );
  const [boundHotkeys, setBoundHotkeys] = useState<Hotkey[]>([]);

  // These callbacks cross a context boundary and feed the listener effect.
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
  const contextValue = useMemo<HotkeysContextType>(
    () => ({
      activeScopes: internalActiveScopes,
      disableScope,
      enableScope,
      hotkeys: boundHotkeys,
      toggleScope,
    }),
    [boundHotkeys, disableScope, enableScope, internalActiveScopes, toggleScope]
  );

  return (
    <HotkeysContext value={contextValue}>
      <BoundHotkeysProxyProviderProvider
        addHotkey={addBoundHotkey}
        removeHotkey={removeBoundHotkey}
      >
        {children}
      </BoundHotkeysProxyProviderProvider>
    </HotkeysContext>
  );
};
