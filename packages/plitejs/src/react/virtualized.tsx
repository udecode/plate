'use client';

import React from 'react';

import type { Element, RootKey } from '..';
import {
  EditableViewportSurface,
  type EditableProps,
} from './components/editable-text-blocks';
import { EditorRoot } from './components/plite';
import {
  useRootNodeKeys,
  useSelectionPaths,
  useTopLevelSelectionIndex,
} from './editable/root-selector-sources';
import { useEditorContext } from './hooks/use-editor-context';
import { useEditorReadOnly } from './hooks/use-editor-read-only';
import {
  getVirtualizerScrollElement,
  useVirtualizedRootPlan,
} from './virtualized/use-virtualized-root-plan';

export type VirtualizedEditableProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = EditableProps<TElement, TRoot> & {
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

const VirtualizedEditableInner = <TElement extends Element>({
  estimatedBlockSize = 32,
  overscan = 2,
  ref: forwardedRef,
  ...props
}: VirtualizedEditableProps<TElement>) => {
  assertOptions({ estimatedBlockSize, overscan });
  const [rootElement, setRootElement] = React.useState<HTMLDivElement | null>(
    null
  );
  const [promotedTopLevelIndex, setPromotedTopLevelIndex] = React.useState<
    number | null
  >(null);
  const topLevelNodeKeys = useRootNodeKeys();
  const selectionPaths = useSelectionPaths(true);
  const selectedTopLevelIndex = useTopLevelSelectionIndex(true);
  const scrollElement = React.useMemo(
    () => getVirtualizerScrollElement(rootElement),
    [rootElement]
  );
  const options = React.useMemo(
    () => ({ estimatedBlockSize, overscan }),
    [estimatedBlockSize, overscan]
  );
  const plan = useVirtualizedRootPlan({
    options,
    promotedTopLevelIndex,
    rootElement,
    scrollElement,
    selectedTopLevelIndex,
    selectionPaths,
    topLevelNodeKeys,
  });
  const viewportPlan = React.useMemo(
    () => ({
      ...plan,
      requestMount: (index: number) => setPromotedTopLevelIndex(index),
    }),
    [plan]
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
export const VirtualizedEditable = <
  TElement extends Element,
  const TRoot extends RootKey = RootKey,
>({
  root,
  ...props
}: VirtualizedEditableProps<TElement, TRoot>) => {
  if (root === 'main') {
    throw new Error('[Plite] Omit root to render the primary editable.');
  }
  const inheritedReadOnly = useEditorReadOnly();
  const editor = useEditorContext();
  const readOnly = props.readOnly || inheritedReadOnly;
  const editable = <VirtualizedEditableInner {...props} />;

  return root === undefined ? (
    editable
  ) : (
    <EditorRoot editor={editor} readOnly={readOnly} root={root}>
      {editable}
    </EditorRoot>
  );
};
