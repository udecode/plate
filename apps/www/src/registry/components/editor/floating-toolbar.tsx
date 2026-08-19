'use client';

import * as React from 'react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import {
  useEditorReadOnly,
  definePlatePlugin,
  useEditor,
  useEditorId,
  useEditorSelector,
  useEventEditorValue,
  usePluginStore,
} from 'platejs/react';
import { AIToolbarButton } from './ai-toolbar-button';
import { CommentToolbarButton } from './comment-toolbar-button';
import { InlineEquationToolbarButton } from './equation-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
import { ToolbarGroup, Toolbar } from './toolbar';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';
import {
  type UseVirtualFloatingOptions,
  flip,
  getSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@platejs/floating';
import { AIChatPlugin } from '@platejs/ai/react';
import { useComposedRef } from '@udecode/cn';
import { useOnClickOutside } from '@udecode/react-utils';
import { mergeProps } from '@udecode/utils';
import { cn } from '@/lib/utils';
import { linkPlugin } from './link';

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

type FloatingToolbarOptions = {
  floatingOptions?: UseVirtualFloatingOptions;
  hideToolbar?: boolean;
  showWhenReadOnly?: boolean;
};

export function FloatingToolbar({
  children,
  className,
  options,
  ...props
}: React.ComponentProps<typeof Toolbar> & {
  options?: FloatingToolbarOptions;
}) {
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorValue('focus');
  const isFloatingLinkOpen = !!usePluginStore(linkPlugin, 'mode');
  const isAIChatOpen = usePluginStore(AIChatPlugin, 'open');
  const editor = useEditor({ id: editorId });
  const selectionExpanded = useEditorSelector(
    (editor) => editor.read.selection.isExpanded(),
    { id: editorId }
  );
  const selectionText = useEditorSelector(
    (editor) => editor.read.text.string(),
    { id: editorId }
  );
  const selectionRange = useEditorSelector(
    (editor) => editor.read.selection.primaryRange(),
    { id: editorId }
  );
  const waitForCollapsedSelection = useEditorSelector(
    (editor, previous = false) => {
      if (!editor.read.selection.isExpanded()) return false;
      if (editorId !== focusedEditorId) return true;

      return previous;
    },
    { id: editorId }
  );
  const readOnly = useEditorReadOnly();
  const [dismissedSelection, setDismissedSelection] =
    React.useState<typeof selectionRange>(null);
  const [mouseDownOpen, setMouseDownOpen] = React.useState<boolean | null>(
    null
  );
  const open =
    selectionExpanded &&
    !!selectionText &&
    editorId === focusedEditorId &&
    !isFloatingLinkOpen &&
    !isAIChatOpen &&
    !options?.hideToolbar &&
    (!readOnly || !!options?.showWhenReadOnly) &&
    (!waitForCollapsedSelection || readOnly) &&
    mouseDownOpen !== false &&
    dismissedSelection !== selectionRange;
  const floating = useVirtualFloating(
    mergeProps<UseVirtualFloatingOptions>(
      {
        open,
        getBoundingClientRect: () => getSelectionBoundingClientRect(editor),
        onOpenChange: (nextOpen) =>
          setDismissedSelection(nextOpen ? null : selectionRange),
      },
      {
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
        ...options?.floatingOptions,
      }
    )
  );
  const openStateRef = React.useRef(open);

  React.useEffect(() => {
    openStateRef.current = open;
  }, [open]);

  React.useEffect(() => {
    const onMouseUp = () => setMouseDownOpen(null);
    const onMouseDown = () => setMouseDownOpen(openStateRef.current);

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const editorVersion = useEditorSelector(
    (editor) => editor.read.lastCommit()?.version ?? 0,
    { id: editorId }
  );

  React.useEffect(() => {
    floating.update?.();
  }, [editorVersion, floating.update]);

  const clickOutsideRef = useOnClickOutside(
    () => setDismissedSelection(selectionRange),
    { ignoreClass: 'ignore-click-outside/toolbar' }
  );

  const ref = useComposedRef<HTMLDivElement>(
    props.ref,
    floating.refs.setFloating
  );

  if (!open) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        {...props}
        ref={ref}
        style={floating.style}
        className={cn(
          'scrollbar-hide absolute z-50 overflow-x-auto whitespace-nowrap rounded-md border bg-popover p-1 opacity-100 shadow-md print:hidden',
          'max-w-[80vw]',
          className
        )}
      >
        {children}
      </Toolbar>
    </div>
  );
}

export const FloatingToolbarPlugin = definePlatePlugin('floatingToolbar', {
  render: {
    afterEditable: () => (
      <FloatingToolbar>
        <FloatingToolbarButtons />
      </FloatingToolbar>
    ),
  },
});

export const FloatingToolbarKit = [FloatingToolbarPlugin] as const;
