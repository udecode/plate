'use client';

import {
  flip,
  offset,
  shift,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { AIChatPlugin } from 'platejs/ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  definePlugin,
  useComposedRef,
  useEditableRef,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
  usePluginStore,
  useSelectionGeometry,
} from 'platejs/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { ToolbarGroup, Toolbar } from '@/registry/components/editor/toolbar';
import { useFloatingRect } from '@/registry/hooks/use-floating-rect';

import { AIToolbarButton } from './ai-toolbar-button';
import { CommentToolbarButton } from './comment-toolbar-button';
import { InlineEquationToolbarButton } from './equation-toolbar-button';
import { linkPlugin } from './link';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <ToolbarGroup>
          <AIToolbarButton tooltip="AI commands">
            <WandSparklesIcon />
            Ask AI
          </AIToolbarButton>
        </ToolbarGroup>
      )}

      {!readOnly && (
        <ToolbarGroup>
          <TurnIntoToolbarButton />
          <StyleButtons />
          <InlineEquationToolbarButton />
          <LinkToolbarButton />
        </ToolbarGroup>
      )}

      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreToolbarButton />}
      </ToolbarGroup>
    </>
  );
}

function StyleButtons() {
  return (
    <>
      <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
        <BoldIcon />
      </MarkToolbarButton>

      <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic">
        <ItalicIcon />
      </MarkToolbarButton>

      <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline">
        <UnderlineIcon />
      </MarkToolbarButton>

      <MarkToolbarButton plugin={StrikethroughPlugin} tooltip="Strikethrough">
        <StrikethroughIcon />
      </MarkToolbarButton>

      <MarkToolbarButton plugin={CodePlugin} tooltip="Code">
        <Code2Icon />
      </MarkToolbarButton>
    </>
  );
}

export function FloatingToolbar({ children }: { children?: React.ReactNode }) {
  const hasNodeSelection = useEditorSelector(
    (editor) => editor.read.selection.nodes().length > 0
  );
  const touch = useCoarsePointer();

  if (hasNodeSelection) return null;

  const buttons =
    children === undefined ? <FloatingToolbarButtons /> : children;

  return touch ? (
    <KeyboardToolbar>{buttons}</KeyboardToolbar>
  ) : (
    <TextFloatingToolbar>{buttons}</TextFloatingToolbar>
  );
}

const COARSE_POINTER_QUERY = '(pointer: coarse)';
const CARET_GAP = 8;

function subscribeCoarsePointer(onChange: () => void) {
  const query = window.matchMedia(COARSE_POINTER_QUERY);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
}

function useCoarsePointer() {
  return React.useSyncExternalStore(
    subscribeCoarsePointer,
    () => window.matchMedia(COARSE_POINTER_QUERY).matches,
    () => false
  );
}

function subscribeViewport(onChange: () => void) {
  const viewport = window.visualViewport;
  const resized = viewport ?? window;

  resized.addEventListener('resize', onChange);
  viewport?.addEventListener('scroll', onChange);

  return () => {
    resized.removeEventListener('resize', onChange);
    viewport?.removeEventListener('scroll', onChange);
  };
}

function readViewportBottom() {
  const viewport = window.visualViewport;

  return viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
}

// A page cannot move the phone's own selection menu, which opens above the selection, and iOS gives it no way to hide it, so touch screens dock the toolbar above the keyboard.
function KeyboardToolbar({ children }: { children: React.ReactNode }) {
  const editableRef = useEditableRef();
  const editorFocused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const isFloatingLinkOpen = !!usePluginStore(linkPlugin, 'mode');
  const isAIChatOpen = usePluginStore(AIChatPlugin, 'open');
  const [ownedOverlayOpen, setOwnedOverlayOpen] = React.useState(false);
  const viewportBottom = React.useSyncExternalStore(
    subscribeViewport,
    readViewportBottom,
    () => 0
  );
  const barRef = React.useRef<HTMLDivElement>(null);
  const open =
    !isFloatingLinkOpen &&
    !isAIChatOpen &&
    !readOnly &&
    (editorFocused || ownedOverlayOpen);

  React.useEffect(() => {
    const document = editableRef.current?.ownerDocument;
    const view = document?.defaultView;

    if (!open || !document || !view) return undefined;

    let frame = 0;
    const revealCaret = () => {
      view.cancelAnimationFrame(frame);
      frame = view.requestAnimationFrame(() => {
        const selection = document.getSelection();
        const node = selection?.focusNode;
        const element = node instanceof Element ? node : node?.parentElement;
        const bar = barRef.current;

        if (
          !bar ||
          !selection?.isCollapsed ||
          !element ||
          !editableRef.current?.contains(element)
        ) {
          return;
        }

        const caret = selection.getRangeAt(0).getClientRects()[0];
        let overlap =
          (caret ?? element.getBoundingClientRect()).bottom +
          CARET_GAP -
          bar.getBoundingClientRect().top;

        for (
          let parent = element.parentElement;
          parent && overlap > 0;
          parent = parent.parentElement
        ) {
          if (!/auto|scroll/.test(view.getComputedStyle(parent).overflowY)) {
            continue;
          }

          const before = parent.scrollTop;

          parent.scrollTop += overlap;
          overlap -= parent.scrollTop - before;
        }

        if (overlap > 0) view.scrollBy(0, overlap);
      });
    };

    document.addEventListener('selectionchange', revealCaret);
    view.visualViewport?.addEventListener('resize', revealCaret);
    revealCaret();

    return () => {
      view.cancelAnimationFrame(frame);
      document.removeEventListener('selectionchange', revealCaret);
      view.visualViewport?.removeEventListener('resize', revealCaret);
    };
  }, [editableRef, open]);

  if (!open) return null;

  return createPortal(
    <Toolbar
      ref={barRef}
      data-slot="keyboard-toolbar"
      onOverlayOpenChange={setOwnedOverlayOpen}
      style={{ top: viewportBottom }}
      className="fixed inset-x-0 z-50 scrollbar-hide -translate-y-full overflow-x-auto border-t bg-popover p-1 whitespace-nowrap print:hidden"
    >
      {children}
    </Toolbar>,
    document.body
  );
}

function TextFloatingToolbar({ children }: { children: React.ReactNode }) {
  const editableRef = useEditableRef();
  const editorFocused = useEditorFocused();
  const isFloatingLinkOpen = !!usePluginStore(linkPlugin, 'mode');
  const isAIChatOpen = usePluginStore(AIChatPlugin, 'open');
  const [selectionRange, setSelectionRange] = React.useState<Range | null>(
    null
  );
  const readOnly = useEditorReadOnly();
  const [dismissedSelection, setDismissedSelection] =
    React.useState<typeof selectionRange>(null);
  const [mouseDownOpen, setMouseDownOpen] = React.useState<boolean | null>(
    null
  );
  const [ownedOverlayOpen, setOwnedOverlayOpen] = React.useState(false);
  // WebKit clears the DOM selection when an owned overlay takes focus, so the overlay alone holds the toolbar.
  const open =
    !isFloatingLinkOpen &&
    !isAIChatOpen &&
    !readOnly &&
    mouseDownOpen !== false &&
    (ownedOverlayOpen ||
      (selectionRange !== null &&
        editorFocused &&
        dismissedSelection !== selectionRange));
  const openStateRef = React.useRef(open);

  React.useEffect(() => {
    openStateRef.current = open;
  }, [open]);

  React.useEffect(() => {
    const document = editableRef.current?.ownerDocument;

    if (!document) return undefined;

    const readSelection = () => {
      const editable = editableRef.current;
      const root = editable?.getRootNode() as Document | ShadowRoot | undefined;
      const selection =
        root && 'getSelection' in root
          ? root.getSelection()
          : document.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const next =
        range &&
        !range.collapsed &&
        selection?.toString() &&
        editable?.contains(range.startContainer) &&
        editable.contains(range.endContainer)
          ? range
          : null;
      setSelectionRange((previous) => {
        if (!next) return null;
        if (
          previous &&
          previous.startContainer === next.startContainer &&
          previous.startOffset === next.startOffset &&
          previous.endContainer === next.endContainer &&
          previous.endOffset === next.endOffset
        ) {
          return previous;
        }
        return next.cloneRange();
      });
    };
    const onMouseUp = () => {
      readSelection();
      setMouseDownOpen(null);
    };
    const onMouseDown = () => {
      setMouseDownOpen(openStateRef.current);
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('selectionchange', readSelection);
    readSelection();

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('selectionchange', readSelection);
    };
  }, [editableRef]);

  if (!open) return null;

  return (
    <PositionedFloatingToolbar
      onOpenChange={(nextOpen) => {
        setDismissedSelection(nextOpen ? null : selectionRange);
      }}
      onOverlayOpenChange={setOwnedOverlayOpen}
    >
      {children}
    </PositionedFloatingToolbar>
  );
}

function PositionedFloatingToolbar({
  children,
  onOpenChange,
  onOverlayOpenChange,
}: {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  onOverlayOpenChange: (open: boolean) => void;
}) {
  const editableRef = useEditableRef();
  const geometry = useSelectionGeometry({ editableRef });
  const floating = useFloatingRect(geometry, {
    open: true,
    middleware: [
      offset(12),
      flip({
        fallbackPlacements: [
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ],
        padding: 12,
      }),
      shift({ padding: 8 }),
    ],
    placement: 'top',
    onOpenChange,
  });
  const dismiss = useDismiss(floating.context, {
    escapeKey: false,
    outsidePress: (event) => {
      const Element =
        floating.elements.floating?.ownerDocument.defaultView?.Element;
      return (
        !Element ||
        !(event.target instanceof Element) ||
        !event.target.closest('[class~="ignore-click-outside/toolbar"]')
      );
    },
  });
  const { getFloatingProps } = useInteractions([dismiss]);
  const ref = useComposedRef(floating.refs.setFloating);

  return (
    <Toolbar
      {...getFloatingProps()}
      ref={ref}
      onOverlayOpenChange={onOverlayOpenChange}
      style={floating.style}
      className="absolute z-50 scrollbar-hide max-w-[80vw] overflow-x-auto rounded-md border bg-popover p-1 whitespace-nowrap opacity-100 shadow-md print:hidden"
    >
      {children}
    </Toolbar>
  );
}

export const FloatingToolbarPlugin = definePlugin('floatingToolbar', {
  slots: {
    caret: () => <FloatingToolbar />,
  },
});

export const FloatingToolbarKit = [FloatingToolbarPlugin] as const;
