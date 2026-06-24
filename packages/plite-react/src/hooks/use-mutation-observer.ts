import { type RefObject, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export function useMutationObserver(
  node: RefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit
) {
  const [mutationObserver] = useState(() => new MutationObserver(callback));
  const observed = useRef<{
    node: HTMLElement;
    options: MutationObserverInit;
  } | null>(null);

  useIsomorphicLayoutEffect(() => {
    // Discard mutations caused during render phase. This works due to react calling
    // useLayoutEffect synchronously after the render phase before the next tick.
    mutationObserver.takeRecords();
  });

  useEffect(() => {
    const current = node.current;

    if (
      observed.current?.node === current &&
      observed.current.options === options
    ) {
      return;
    }

    mutationObserver.disconnect();
    observed.current = null;

    if (!current) {
      return;
    }

    mutationObserver.observe(current, options);
    observed.current = { node: current, options };
  });

  useEffect(
    () => () => {
      mutationObserver.disconnect();
      observed.current = null;
    },
    [mutationObserver]
  );
}
