import React from 'react';

import {
  getPlateTarget,
  PlateScopeContext,
  useFixedScope,
  usePlateTarget,
} from '../internal/plate-context';
import { useEditorEditableElement, useSelectionView } from '../plite-react';
import { useEditor, useEditorContainerRef } from '../stores/plate/useEditor';

/**
 * Give children the mounted view whose root holds the selection, such as a
 * board note's view inside the page, as the editor they act on. Inside it
 * `useEditor()`, `useEditableRef()`, `useEditorFocused()` and
 * `useFocusedLast()` answer for that view. Children keep the current editor
 * when the selection is in its root, when no view of the selection's root is
 * mounted inside its Editable, or when several are and none is focused or was
 * focused last.
 */
export function EditorSelectionView({
  children,
}: {
  children: React.ReactNode;
}) {
  const surrounding = React.useContext(PlateScopeContext);
  const current = usePlateTarget();
  const editor = useEditor();
  const containerRef = useEditorContainerRef();
  const view = useSelectionView(editor);
  const editable = useEditorEditableElement(view);
  const mountedTarget = getPlateTarget(view);
  const target = React.useMemo(
    () =>
      mountedTarget ?? {
        editor: view,
        containerRef,
        editableRef: {
          get current() {
            return editable?.isConnected ? editable : null;
          },
        },
      },
    [containerRef, editable, mountedTarget, view]
  );
  const scope = useFixedScope(
    target,
    view === editor && current === surrounding.fallback
  );

  return <PlateScopeContext value={scope}>{children}</PlateScopeContext>;
}
