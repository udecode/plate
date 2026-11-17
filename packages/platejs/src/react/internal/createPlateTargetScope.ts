export function createPlateTargetScope<T extends object>(
  usedAt: (target: T) => number
) {
  const targets = new Set<T>();
  const primary = new Set<T>();
  const listeners = new Set<() => void>();
  let selected: T | null = null;
  const select = (next: T | null) => {
    if (next === selected) return;
    selected = next;
    listeners.forEach((listener) => listener());
  };
  const firstPrimary = () => primary.values().next().value ?? null;
  const findLatestUsed = () => {
    let latest: T | null = null;
    let latestStamp = 0;

    for (const target of targets) {
      const stamp = usedAt(target);

      if (stamp > latestStamp) {
        latest = target;
        latestStamp = stamp;
      }
    }

    return latest;
  };
  const latestAt = () => (selected ? usedAt(selected) : 0);

  return {
    getSnapshot: () => selected,
    register(target: T, isPrimary: boolean) {
      targets.add(target);
      if (isPrimary) primary.add(target);
      if (usedAt(target) > latestAt()) select(target);
      else if (latestAt() === 0) select(firstPrimary());
      let registered = true;
      return () => {
        if (!registered) return;
        registered = false;
        targets.delete(target);
        primary.delete(target);
        if (selected !== target) return;
        const nothingUsed = latestAt() === 0;
        select(
          nothingUsed ? firstPrimary() : (findLatestUsed() ?? firstPrimary())
        );
      };
    },
    setPrimary(target: T, isPrimary: boolean) {
      if (!targets.has(target)) return;
      if (isPrimary) primary.add(target);
      else primary.delete(target);
      if (latestAt() === 0) select(firstPrimary());
    },
    used(target: T) {
      if (targets.has(target) && usedAt(target) >= latestAt()) select(target);
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
