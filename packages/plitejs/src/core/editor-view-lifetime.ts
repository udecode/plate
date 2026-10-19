const viewCleanups = new WeakMap<object, Set<() => void>>();

export const registerEditorViewLifetimeCleanup = (
  view: object,
  cleanup: () => void
): (() => void) => {
  const cleanups = viewCleanups.get(view) ?? new Set<() => void>();

  cleanups.add(cleanup);
  viewCleanups.set(view, cleanups);
  let active = true;

  return () => {
    if (!active) return;

    active = false;
    cleanups.delete(cleanup);
    if (cleanups.size === 0) viewCleanups.delete(view);
  };
};

export const releaseEditorViewLifetime = (view: object): void => {
  const cleanups = viewCleanups.get(view);

  if (!cleanups) return;

  viewCleanups.delete(view);
  for (const cleanup of cleanups) cleanup();
  cleanups.clear();
};
