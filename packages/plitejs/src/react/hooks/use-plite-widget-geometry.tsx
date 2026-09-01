import { useMemo, useSyncExternalStore, type RefObject } from 'react';

import {
  createPliteWidgetGeometryOwner,
  type PliteWidgetGeometry,
} from '../widget-geometry';
import type { PliteWidgetStore } from '../widget-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Identifies the exact mounted Editable used to resolve Widget geometry. */
export type UsePliteWidgetGeometryOptions = Readonly<{
  editableRef: RefObject<HTMLElement | null>;
}>;

/** Read one Widget's geometry in one exact Editable. */
export function usePliteWidgetGeometry<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: PliteWidgetStore<T, TAnnotation>,
  id: string,
  { editableRef }: UsePliteWidgetGeometryOptions
): PliteWidgetGeometry | null {
  const owner = useMemo(
    () => createPliteWidgetGeometryOwner(store, id, editableRef),
    [editableRef, id, store]
  );

  useIsomorphicLayoutEffect(() => owner.activate(), [owner]);
  useIsomorphicLayoutEffect(() => {
    owner.refresh();
    queueMicrotask(owner.refresh);
  });

  return useSyncExternalStore(
    owner.subscribe,
    owner.getSnapshot,
    owner.getServerSnapshot
  );
}
