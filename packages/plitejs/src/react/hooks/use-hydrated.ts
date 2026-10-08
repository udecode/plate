import { useSyncExternalStore } from 'react';

const subscribeToNothing = () => () => {};

/**
 * False on the server and during hydration, then true on the client, so a
 * render that depends on the DOM matches the server HTML first.
 *
 * @internal
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
