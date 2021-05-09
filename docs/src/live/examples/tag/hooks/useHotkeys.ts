import { useCallback, useEffect } from 'react';
import hotkeys, { HotkeysEvent } from 'hotkeys-js';

type CallbackFn = (event: KeyboardEvent, handler: HotkeysEvent) => void;

export const useHotkeys = (
  keys: string,
  callback: CallbackFn,
  deps: any[] = []
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoisedCallback = useCallback(callback, deps);

  useEffect(() => {
    hotkeys.filter = () => {
      return true;
    };
    hotkeys(keys, memoisedCallback);

    return () => hotkeys.unbind(keys);
  }, [keys, memoisedCallback]);
};
