import React from 'react';

export function useEffectOnce(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  const initialized = React.useRef(false);
  const prevDepsRef = React.useRef(deps);

  React.useEffect(() => {
    const depsChanged = deps.some((dep, i) => dep !== prevDepsRef.current[i]);

    if (!initialized.current || depsChanged) {
      initialized.current = true;
      prevDepsRef.current = deps;
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
