import { useContext, useMemo } from 'react';
import type { Element, NamedRootKey, RootKey } from '@platejs/plite';

import { NodeRuntimeIdContext } from '../context';
import { useOptionalElement } from './use-element';

const DEFAULT_CHILD_ROOT_SLOT = 'default';

const isChildRootMap = (value: unknown): value is Record<string, RootKey> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((root) => typeof root === 'string');

const getExplicitChildRoot = (
  element: Element,
  slot: string
): RootKey | null => {
  const childRoots = isChildRootMap(element.childRoots)
    ? element.childRoots
    : null;
  const defaultChildRoot =
    typeof element.childRoot === 'string' ? element.childRoot : undefined;

  return (
    childRoots?.[slot] ??
    (slot === DEFAULT_CHILD_ROOT_SLOT
      ? (childRoots?.[DEFAULT_CHILD_ROOT_SLOT] ?? defaultChildRoot)
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
): NamedRootKey {
  const contextElement = useOptionalElement();
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
      if (explicitRoot === 'main') {
        throw new Error(
          '[Plite] A child content root cannot target the primary document.'
        );
      }

      return explicitRoot as NamedRootKey;
    }

    if (!runtimeId) {
      throw new Error(
        '`usePliteChildRoot` needs an element runtime id when no explicit child root key exists.'
      );
    }

    return `plite-child:${runtimeId}:${slot}`;
  }, [runtimeId, slot, targetElement]);
}
