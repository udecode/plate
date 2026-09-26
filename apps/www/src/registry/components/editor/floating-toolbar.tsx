'use client';

import { flip, offset, useDismiss, useInteractions } from '@floating-ui/react';
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
  type EditableSiblingProps,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  definePlugin,
  useComposedRef,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
  usePluginStore,
  useSelectionGeometry,
} from 'platejs/react';
import * as React from 'react';

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
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <TurnIntoToolbarButton />

            <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic (⌘+I)">
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              plugin={UnderlinePlugin}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              plugin={StrikethroughPlugin}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={CodePlugin} tooltip="Code (⌘+E)">
              <Code2Icon />
            </MarkToolbarButton>

            <InlineEquationToolbarButton />

            <LinkToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreToolbarButton />}
      </ToolbarGroup>
    </>
  );
}

export function FloatingToolbar({
  children,
  ...props
}: React.PropsWithChildren<EditableSiblingProps>) {
  const hasNodeSelection = useEditorSelector(
    (editor) => editor.read.selection.nodes().length > 0
  );

  if (hasNodeSelection) return null;

  return (
    <TextFloatingToolbar {...props}>
      {children === undefined ? <FloatingToolbarButtons /> : children}
    </TextFloatingToolbar>
  );
}

function TextFloatingToolbar({
  children,
  editableRef,
}: React.PropsWithChildren<EditableSiblingProps>) {
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
  const open =
    selectionRange !== null &&
    (editorFocused || ownedOverlayOpen) &&
    !isFloatingLinkOpen &&
    !isAIChatOpen &&
    !readOnly &&
    mouseDownOpen !== false &&
    dismissedSelection !== selectionRange;
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
      editableRef={editableRef}
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
  editableRef,
  onOpenChange,
  onOverlayOpenChange,
}: React.PropsWithChildren<EditableSiblingProps> & {
  onOpenChange: (open: boolean) => void;
  onOverlayOpenChange: (open: boolean) => void;
}) {
  const geometry = useSelectionGeometry({ editableRef });
  const floating = useFloatingRect(geometry?.boundingRect ?? null, {
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
    afterEditable: FloatingToolbar,
  },
});

export const FloatingToolbarKit = [FloatingToolbarPlugin] as const;
