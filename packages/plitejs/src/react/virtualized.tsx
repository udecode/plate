'use client';

import React from 'react';

import type { Element, RootKey } from '..';
import {
  EditableViewportSurface,
  type EditorContentProps,
} from './components/editable-text-blocks';
import { SurfaceRoot } from './components/plite';
import {
  useDescendantCaretOwnerPaths,
  useRootNodeKeys,
  useSelectionPaths,
} from './editable/root-selector-sources';
import { useEditorContext } from './hooks/use-editor-context';
import { useEditorHostScrollElement } from './hooks/use-editor-dom-scope';
import { useInheritedReadOnly } from './hooks/use-editor-read-only';
import { findScrollableAncestor } from './scroll-root';
import { useVirtualizedRootPlan } from './virtualized/use-virtualized-root-plan';

export type VirtualizedEditorContentProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = EditorContentProps<TElement, TRoot> & {
  /** Estimated height in CSS pixels for an unmeasured top-level block. */
  estimatedBlockSize?: number;
  /** Extra top-level blocks rendered before and after the visible range. */
  overscan?: number;
};

const assertOptions = ({
  estimatedBlockSize,
  overscan,
}: {
  estimatedBlockSize: number;
  overscan: number;
}) => {
  if (!Number.isFinite(estimatedBlockSize) || estimatedBlockSize <= 0) {
    throw new RangeError('estimatedBlockSize must be a positive finite number');
  }
  if (!Number.isInteger(overscan) || overscan < 0) {
    throw new RangeError('overscan must be a nonnegative integer');
  }
};

const VirtualizedEditorContentInner = <TElement extends Element>({
  estimatedBlockSize = 32,
  overscan = 2,
  ref: forwardedRef,
  ...props
}: VirtualizedEditorContentProps<TElement>) => {
  assertOptions({ estimatedBlockSize, overscan });
  const [rootElement, setRootElement] = React.useState<HTMLDivElement | null>(
    null
  );
  const [promotedTopLevelIndexes, setPromotedTopLevelIndexes] = React.useState<
    readonly number[]
  >([]);
  const promotionBatchActiveRef = React.useRef(false);
  const topLevelNodeKeys = useRootNodeKeys();
  const selectionPaths = useSelectionPaths(true);
  const descendantCaretOwnerPaths = useDescendantCaretOwnerPaths(true);
  const hostScrollElement = useEditorHostScrollElement(useEditorContext());
  const scrollElement = React.useMemo(
    () => hostScrollElement ?? findScrollableAncestor(rootElement),
    [hostScrollElement, rootElement]
  );
  const options = React.useMemo(
    () => ({ estimatedBlockSize, overscan }),
    [estimatedBlockSize, overscan]
  );
  const plan = useVirtualizedRootPlan({
    options,
    promotedTopLevelIndexes,
    retainedPaths: descendantCaretOwnerPaths,
    rootElement,
    scrollElement,
    selectionPaths,
    topLevelNodeKeys,
  });
  const requestMount = React.useCallback((index: number) => {
    const appendToBatch = promotionBatchActiveRef.current;

    if (!appendToBatch) {
      promotionBatchActiveRef.current = true;
      queueMicrotask(() => {
        promotionBatchActiveRef.current = false;
      });
    }

    setPromotedTopLevelIndexes((prev) => {
      if (!appendToBatch) {
        return prev.length === 1 && prev[0] === index ? prev : [index];
      }

      return prev.includes(index) ? prev : [...prev, index];
    });
  }, []);
  const viewportPlan = React.useMemo(
    () => ({
      ...plan,
      requestMount,
    }),
    [plan, requestMount]
  );
  const ref = React.useCallback(
    (element: HTMLDivElement | null) => {
      setRootElement(element);

      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    },
    [forwardedRef]
  );

  return (
    <EditableViewportSurface {...props} ref={ref} viewportPlan={viewportPlan} />
  );
};

/** Render one explicitly virtualized Plite root. */
export const VirtualizedEditorContent = <
  TElement extends Element,
  const TRoot extends RootKey = RootKey,
>({
  root,
  ...props
}: VirtualizedEditorContentProps<TElement, TRoot>) => {
  if (root === 'main') {
    throw new Error('Omit root to render the primary editable.');
  }
  const inheritedReadOnly = useInheritedReadOnly();
  const editor = useEditorContext();
  const readOnly = props.readOnly || inheritedReadOnly;
  const editable = <VirtualizedEditorContentInner {...props} />;

  return root === undefined ? (
    editable
  ) : (
    <SurfaceRoot editor={editor} readOnly={readOnly} root={root}>
      {editable}
    </SurfaceRoot>
  );
};
