export function createPlateTargetScope<T extends object>() {
  const targets = new Set<T>();
  const primary = new Set<T>();
  const listeners = new Set<() => void>();
  let active: T | null = null;
  let selected: T | null = null;
  const publish = () => {
    const next = active ?? primary.values().next().value ?? null;
    if (next === selected) return;
    selected = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => selected,
    register(target: T, isPrimary: boolean) {
      targets.add(target);
      if (isPrimary) primary.add(target);
      publish();
      let registered = true;
      return () => {
        if (!registered) return;
        registered = false;
        targets.delete(target);
        primary.delete(target);
        if (active === target) active = null;
        publish();
      };
    },
    setPrimary(target: T, isPrimary: boolean) {
      if (!targets.has(target)) return;
      if (isPrimary) primary.add(target);
      else primary.delete(target);
      publish();
    },
    focus(target: T) {
      if (!targets.has(target)) return;
      active = target;
      publish();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
