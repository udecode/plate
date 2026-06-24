import { useContext, useMemo } from 'react';
import type { Element, RootKey } from '@platejs/plite';

import { NodeRuntimeIdContext } from '../context';
import { useOptionalElementContext } from './use-element';

const DEFAULT_CHILD_ROOT_SLOT = 'default';

type ChildRootElement = Element & {
  childRoot?: RootKey;
  childRoots?: Record<string, RootKey>;
};

const isChildRootMap = (value: unknown): value is Record<string, RootKey> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((root) => typeof root === 'string');

const getExplicitChildRoot = (
  element: Element,
  slot: string
): RootKey | null => {
  const childRootElement = element as ChildRootElement;
  const childRoots = isChildRootMap(childRootElement.childRoots)
    ? childRootElement.childRoots
    : null;

  return (
    childRoots?.[slot] ??
    (slot === DEFAULT_CHILD_ROOT_SLOT
      ? (childRoots?.[DEFAULT_CHILD_ROOT_SLOT] ?? childRootElement.childRoot)
      : null) ??
    null
  );
};

/**
 * Resolve a stable same-runtime root key owned by an element.
 *
 * Prefer storing `childRoots[slot]` on the element when the child root is part
 * of persisted document data. The runtime-id fallback is useful for ephemeral
 * island roots, but it is intentionally not a persistence contract.
 */
export function usePliteChildRoot(
  element?: Element | null,
  slot: string = DEFAULT_CHILD_ROOT_SLOT
): RootKey {
  const contextElement = useOptionalElementContext();
  const runtimeId = useContext(NodeRuntimeIdContext);
  const targetElement = element ?? contextElement;

  return useMemo(() => {
    if (!targetElement) {
      throw new Error(
        '`usePliteChildRoot` must receive an element or be used inside an element renderer.'
      );
    }

    const explicitRoot = getExplicitChildRoot(targetElement, slot);

    if (explicitRoot) {
      return explicitRoot;
    }

    if (!runtimeId) {
      throw new Error(
        '`usePliteChildRoot` needs an element runtime id when no explicit child root key exists.'
      );
    }

    return `plite-child:${runtimeId}:${slot}`;
  }, [runtimeId, slot, targetElement]);
}
