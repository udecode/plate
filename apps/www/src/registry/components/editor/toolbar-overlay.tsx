'use client';

import { EditorProvider, useOptionalEditor } from 'platejs/react';
import * as React from 'react';

const ToolbarOverlayContext = React.createContext<
  (id: symbol, open: boolean) => void
>(() => {});

export function useToolbarOverlayTrigger(
  props: Pick<React.AriaAttributes, 'aria-expanded' | 'aria-haspopup'>
) {
  const [overlayId] = React.useState(() => Symbol('toolbar-overlay'));
  const reportOverlayOpen = React.useContext(ToolbarOverlayContext);
  const ownsOverlay =
    props['aria-haspopup'] !== undefined && props['aria-haspopup'] !== false;
  const open =
    props['aria-expanded'] === true || props['aria-expanded'] === 'true';
  const registeredRef = React.useRef(false);

  React.useEffect(() => {
    if (ownsOverlay) {
      registeredRef.current = true;
      reportOverlayOpen(overlayId, open);
    } else if (registeredRef.current) {
      registeredRef.current = false;
      reportOverlayOpen(overlayId, false);
    }
  }, [open, overlayId, ownsOverlay, reportOverlayOpen]);

  React.useEffect(
    () => () => {
      if (registeredRef.current) reportOverlayOpen(overlayId, false);
    },
    [overlayId, reportOverlayOpen]
  );

  return () => {
    if (ownsOverlay) reportOverlayOpen(overlayId, true);
  };
}

export function ToolbarOverlayProvider({
  children,
  onOpenChange,
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const editor = useOptionalEditor();
  const liveRef = React.useRef({ editor, onOpenChange });
  const [capturedEditor, setCapturedEditor] = React.useState<
    typeof editor | undefined
  >(undefined);
  React.useInsertionEffect(() => {
    liveRef.current = { editor, onOpenChange };
  }, [editor, onOpenChange]);
  const openOverlayIdsRef = React.useRef(new Set<symbol>());
  const overlayOpenRef = React.useRef(false);
  const reportOverlayOpen = React.useCallback((id: symbol, open: boolean) => {
    if (open) {
      openOverlayIdsRef.current.add(id);
    } else {
      openOverlayIdsRef.current.delete(id);
    }

    const nextOpen = openOverlayIdsRef.current.size > 0;

    if (overlayOpenRef.current !== nextOpen) {
      overlayOpenRef.current = nextOpen;
      setCapturedEditor(nextOpen ? liveRef.current.editor : undefined);
      liveRef.current.onOpenChange?.(nextOpen);
    }
  }, []);

  return (
    <ToolbarOverlayContext.Provider value={reportOverlayOpen}>
      <EditorProvider
        editor={capturedEditor === undefined ? editor : capturedEditor}
      >
        {children}
      </EditorProvider>
    </ToolbarOverlayContext.Provider>
  );
}
