export function createPlateTargetScope<T extends object>(
  usedAt: (target: T) => number
) {
  const targets = new Set<T>();
  const listeners = new Set<() => void>();
  const watchers = new Set<() => void>();
  let selected: T | null = null;
  const select = (next: T | null) => {
    if (next !== selected) {
      selected = next;
      listeners.forEach((listener) => listener());
    }
    watchers.forEach((watcher) => watcher());
  };
  const first = () => targets.values().next().value ?? null;
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
  const listen = (to: Set<() => void>) => (listener: () => void) => {
    to.add(listener);
    return () => {
      to.delete(listener);
    };
  };

  return {
    getSnapshot: () => selected,
    register(target: T) {
      targets.add(target);
      if (usedAt(target) > latestAt()) select(target);
      else if (latestAt() === 0) select(first());
      let registered = true;
      return () => {
        if (!registered) return;
        registered = false;
        targets.delete(target);
        if (selected !== target) return;
        const nothingUsed = latestAt() === 0;
        select(nothingUsed ? first() : (findLatestUsed() ?? first()));
      };
    },
    used(target: T) {
      if (targets.has(target) && usedAt(target) >= latestAt()) select(target);
    },
    subscribe: listen(listeners),
    subscribeEverySelect: listen(watchers),
  };
}
