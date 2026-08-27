'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import {
  type UseVirtualFloatingOptions,
  flip,
  getSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@platejs/floating';
import { useComposedRef } from '@udecode/cn';
import { useOnClickOutside } from '@udecode/react-utils';
import { mergeProps } from '@udecode/utils';
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import {
  definePlatePlugin,
  useEditor,
  useEditorFocused,
  useEditorId,
  useEditorReadOnly,
  useEditorSelector,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { ToolbarGroup, Toolbar } from '@/registry/components/editor/toolbar';

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

type FloatingToolbarOptions = {
  floatingOptions?: UseVirtualFloatingOptions;
  hideToolbar?: boolean;
  showWhenReadOnly?: boolean;
};

type FloatingToolbarProps = React.ComponentProps<typeof Toolbar> & {
  options?: FloatingToolbarOptions;
};

export function FloatingToolbar(props: FloatingToolbarProps) {
  const editorId = useEditorId();
  const hasNodeSelection = useEditorSelector(
    (editor) => editor.read.selection.nodes().length > 0,
    { id: editorId }
  );

  if (hasNodeSelection) return null;

  return <TextFloatingToolbar {...props} />;
}

function TextFloatingToolbar({
  children,
  className,
  options,
  ...props
}: FloatingToolbarProps) {
  const editorId = useEditorId();
  const editorFocused = useEditorFocused();
  const isFloatingLinkOpen = !!usePluginStore(linkPlugin, 'mode');
  const isAIChatOpen = usePluginStore(AIChatPlugin, 'open');
  const editor = useEditor({ id: editorId });
  const selectionExpanded = useEditorSelector(
    (innerEditor) => innerEditor.read.selection.isExpanded(),
    { id: editorId }
  );
  const selectionText = useEditorSelector(
    (innerEditor2) => innerEditor2.read.text.string(),
    { id: editorId }
  );
  const selectionRange = useEditorSelector(
    (innerEditor3) => innerEditor3.read.selection(),
    { id: editorId }
  );
  const waitForCollapsedSelection = useEditorSelector(
    (innerEditor4, previous = false) => {
      if (!innerEditor4.read.selection.isExpanded()) return false;
      if (!editorFocused) return true;

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
  const [ownedOverlayOpen, setOwnedOverlayOpen] = React.useState(false);
  const open =
    selectionExpanded &&
    !!selectionText &&
    (editorFocused || ownedOverlayOpen) &&
    !isFloatingLinkOpen &&
    !isAIChatOpen &&
    !options?.hideToolbar &&
    (!readOnly || !!options?.showWhenReadOnly) &&
    (!waitForCollapsedSelection || readOnly || ownedOverlayOpen) &&
    mouseDownOpen !== false &&
    dismissedSelection !== selectionRange;

  const floating = useVirtualFloating(
    mergeProps<UseVirtualFloatingOptions>(
      {
        open,
        getBoundingClientRect: () => getSelectionBoundingClientRect(editor),
        onOpenChange: (nextOpen) => {
          setDismissedSelection(nextOpen ? null : selectionRange);
        },
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
    const onMouseUp = () => {
      setMouseDownOpen(null);
    };
    const onMouseDown = () => {
      setMouseDownOpen(openStateRef.current);
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const editorVersion = useEditorSelector(
    (innerEditor5) => innerEditor5.read.lastCommit()?.version ?? 0,
    { id: editorId }
  );
  const updateFloating = floating.update;

  React.useEffect(() => {
    if (open) updateFloating?.();
  }, [editorVersion, open, updateFloating]);

  const clickOutsideRef = useOnClickOutside(
    () => {
      setDismissedSelection(selectionRange);
    },
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
        onOverlayOpenChange={setOwnedOverlayOpen}
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
