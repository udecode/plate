'use client';

import React from 'react';

import type { Element, Path, RootKey } from '../..';
import type { PliteDecorationStore } from '../decoration-context';
import { useRootNodeKeys } from '../editable/root-selector-sources';
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorReadOnly } from '../hooks/use-editor-read-only';
import { createEditableViewportPlan } from '../viewport-plan';
import {
  type EditableElementLayout,
  EditableViewportSurface,
  type EditableProps,
} from './editable-text-blocks';
import { EditorRoot } from './plite';

export type WindowedEditableProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = EditableProps<TElement, TRoot> & {
  decorationStore?: PliteDecorationStore | null;
  elementLayouts?: ReadonlyMap<string, EditableElementLayout | null>;
  enabled?: boolean;
  mountedTopLevelIndexes: readonly number[];
  onRequestMount?: (index: number, path?: Path) => void;
  scrollToPath: (
    path: Path,
    align?: 'auto' | 'center' | 'end' | 'start'
  ) => boolean;
  totalSize: number;
};

const WindowedEditableInner = <TElement extends Element>({
  decorationStore,
  elementLayouts,
  enabled = true,
  mountedTopLevelIndexes,
  onRequestMount,
  scrollToPath,
  totalSize,
  ...props
}: WindowedEditableProps<TElement>) => {
  const topLevelNodeKeys = useRootNodeKeys();
  const viewportPlan = React.useMemo(
    () =>
      enabled
        ? createEditableViewportPlan({
            coordinateSpace: 'canvas',
            indexes: mountedTopLevelIndexes,
            requestMount: onRequestMount,
            scrollToPath,
            sizeAtIndex: () => 0,
            startAtIndex: () => 0,
            topLevelNodeKeys,
            totalSize,
          })
        : null,
    [
      enabled,
      mountedTopLevelIndexes,
      onRequestMount,
      scrollToPath,
      topLevelNodeKeys,
      totalSize,
    ]
  );

  return (
    <EditableViewportSurface
      {...props}
      decorationStore={decorationStore}
      elementLayouts={elementLayouts}
      viewportPlan={viewportPlan}
    />
  );
};

export const WindowedEditable = <
  TElement extends Element,
  const TRoot extends RootKey = RootKey,
>({
  root,
  ...props
}: WindowedEditableProps<TElement, TRoot>) => {
  if (root === 'main') {
    throw new Error('[Plite] Omit root to render the primary editable.');
  }
  const inheritedReadOnly = useEditorReadOnly();
  const editor = useEditorContext();
  const readOnly = props.readOnly || inheritedReadOnly;
  const editable = <WindowedEditableInner {...props} />;

  return root === undefined ? (
    editable
  ) : (
    <EditorRoot editor={editor} readOnly={readOnly} root={root}>
      {editable}
    </EditorRoot>
  );
};
