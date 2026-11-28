'use client';

import { cn } from 'cn';
import {
  BaselineIcon,
  BoldIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from 'platejs/media';
import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  FontBackgroundColorPlugin,
  FontColorPlugin,
  useComposedRef,
  useEditorReadOnly,
  useEditorSelector,
  definePlugin,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { ToolbarGroup, Toolbar } from '@/registry/components/editor/toolbar';

import { AIToolbarButton } from './ai-toolbar-button';
import { AlignToolbarButton } from './align-toolbar-button';
import { ClearFormattingToolbarButton } from './clear-formatting-toolbar-button';
import {
  AllCommentsButton,
  CommentToolbarButton,
} from './comment-toolbar-button';
import { DetailsToolbarButton } from './details-toolbar-button';
import { EmojiToolbarButton } from './emoji-toolbar-button';
import {
  DEFAULT_COLORS,
  FontColorToolbarButton,
} from './font-color-toolbar-button';
import { FontSizeToolbarButton } from './font-size-toolbar-button';
import { FormatPainterToolbarButton } from './format-painter-toolbar-button';
import { RedoToolbarButton, UndoToolbarButton } from './history-toolbar-button';
import {
  IndentToolbarButton,
  OutdentToolbarButton,
} from './indent-toolbar-button';
import { InsertToolbarButton } from './insert-toolbar-button';
import { LineHeightToolbarButton } from './line-height-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from './list-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MediaToolbarButton } from './media-toolbar-button';
import { ModeToolbarButton } from './mode-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { TableToolbarButton } from './table-toolbar-button';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

export function FixedToolbarButtons({
  children,
}: {
  children?: React.ReactNode;
} = {}) {
  const viewing = useEditorSelector(
    (current) => current.read.view.isViewing(),
    { dependsOn: 'readOnly' }
  );
  const readOnly = useEditorReadOnly();

  return (
    <div className="flex w-max min-w-full shrink-0 items-center">
      {!viewing && (
        <ToolbarGroup>
          <UndoToolbarButton />
          <RedoToolbarButton />
        </ToolbarGroup>
      )}

      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
            </AIToolbarButton>
          </ToolbarGroup>

          {children}

          <ToolbarGroup>
            <InsertToolbarButton />
            <TurnIntoToolbarButton />
            <FontSizeToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic">
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline">
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              plugin={StrikethroughPlugin}
              tooltip="Strikethrough"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={CodePlugin} tooltip="Code">
              <Code2Icon />
            </MarkToolbarButton>

            <FontColorToolbarButton
              colors={DEFAULT_COLORS}
              plugin={FontColorPlugin}
              tooltip="Text color"
            >
              <BaselineIcon />
            </FontColorToolbarButton>

            <FontColorToolbarButton
              colors={DEFAULT_COLORS}
              plugin={FontBackgroundColorPlugin}
              tooltip="Background color"
            >
              <PaintBucketIcon />
            </FontColorToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignToolbarButton />
            <ClearFormattingToolbarButton />
            <FormatPainterToolbarButton />

            <NumberedListToolbarButton />
            <BulletedListToolbarButton />
            <TodoListToolbarButton />
            <DetailsToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />
            <TableToolbarButton />
            <EmojiToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MediaToolbarButton plugin={BaseImagePlugin} />
            <MediaToolbarButton plugin={BaseVideoPlugin} />
            <MediaToolbarButton plugin={BaseAudioPlugin} />
            <MediaToolbarButton plugin={BaseFilePlugin} />
          </ToolbarGroup>

          <ToolbarGroup>
            <LineHeightToolbarButton />
            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MoreToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <div className="grow" />

      <ToolbarGroup>
        <MarkToolbarButton plugin={HighlightPlugin} tooltip="Highlight">
          <HighlighterIcon />
        </MarkToolbarButton>
        <CommentToolbarButton />
        <AllCommentsButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}

function syncObservedChildren(
  toolbar: HTMLDivElement,
  resizeObserver: ResizeObserver,
  observedChildren: Set<Element>
) {
  for (const child of toolbar.children) {
    if (!observedChildren.has(child)) {
      observedChildren.add(child);
      resizeObserver.observe(child);
    }
  }
  for (const child of observedChildren) {
    if (child.parentElement !== toolbar) {
      observedChildren.delete(child);
      resizeObserver.unobserve(child);
    }
  }
}

export function FixedToolbar({
  children,
  className,
  ref,
  ...props
}: React.ComponentProps<typeof Toolbar>) {
  const [toolbar, setToolbar] = React.useState<HTMLDivElement | null>(null);
  const toolbarRef = useComposedRef(ref, setToolbar);
  const [overflow, setOverflow] = React.useState({ end: false, start: false });

  React.useEffect(() => {
    if (!toolbar) return undefined;

    // RTL scrollLeft runs from 0 down to -max, so the distance from the start
    // edge is its absolute value in both directions.
    const measure = () => {
      const afterStyle = getComputedStyle(toolbar, '::after');
      const spacerWidth =
        afterStyle.content !== '' &&
        afterStyle.content !== 'none' &&
        afterStyle.display !== 'none'
          ? Number.parseFloat(afterStyle.width) || 0
          : 0;
      const contentWidth = toolbar.scrollWidth - spacerWidth;
      if (contentWidth <= toolbar.clientWidth + 1) {
        setOverflow((current) =>
          current.start || current.end ? { end: false, start: false } : current
        );
        return;
      }

      const max = toolbar.scrollWidth - toolbar.clientWidth;
      const offset = Math.abs(toolbar.scrollLeft);
      const start = offset > 1;
      const end = max - offset > 1;

      setOverflow((current) =>
        current.start === start && current.end === end
          ? current
          : { end, start }
      );
    };
    const onWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        toolbar.scrollWidth <= toolbar.clientWidth
      ) {
        return;
      }

      const max = toolbar.scrollWidth - toolbar.clientWidth;
      const offset = Math.abs(toolbar.scrollLeft);

      if (event.deltaY > 0 ? max - offset <= 1 : offset <= 1) return;

      event.preventDefault();
      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaY;
      toolbar.scrollBy({
        left: getComputedStyle(toolbar).direction === 'rtl' ? -delta : delta,
      });
    };

    // The toolbar box keeps its size when buttons mount or grow, so watch the
    // content as well as the box.
    const observedChildren = new Set<Element>();
    const resizeObserver = new ResizeObserver(measure);

    resizeObserver.observe(toolbar);
    syncObservedChildren(toolbar, resizeObserver, observedChildren);
    const mutationObserver = new MutationObserver(() => {
      syncObservedChildren(toolbar, resizeObserver, observedChildren);
      measure();
    });
    mutationObserver.observe(toolbar, { childList: true, subtree: true });
    toolbar.addEventListener('scroll', measure, { passive: true });
    toolbar.addEventListener('wheel', onWheel, { passive: false });
    measure();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      toolbar.removeEventListener('scroll', measure);
      toolbar.removeEventListener('wheel', onWheel);
    };
  }, [toolbar]);

  const scrollToward = (side: 'end' | 'start') => {
    if (!toolbar) return;

    const rtl = getComputedStyle(toolbar).direction === 'rtl';
    const distance = toolbar.clientWidth * 0.75;
    toolbar.scrollBy({
      behavior: 'smooth',
      left: (side === 'end') === rtl ? -distance : distance,
    });
  };

  const hasOverflow = overflow.start || overflow.end;

  return (
    // z-50 keeps the toolbar above Base UI modal menu backdrops so touch swipes reach it while staying below Find's z-60.
    <Toolbar
      data-editor-keep-selection-visible=""
      {...props}
      ref={toolbarRef}
      className={cn(
        'no-scrollbar z-50 w-full shrink-0 justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-background p-1',
        hasOverflow &&
          'after:block after:w-14 after:shrink-0 after:content-[""] pointer-coarse:after:hidden',
        className
      )}
      data-slot="fixed-toolbar"
    >
      {/* One sticky layer the width of the visible toolbar, with negative
          inline margins so it adds nothing to scrollWidth. */}
      {hasOverflow && (
        <div className="pointer-events-none sticky -start-1 z-10 -my-1 -ms-1 -me-[calc(100%+0.25rem)] flex w-[calc(100%+0.5rem)] shrink-0 self-stretch">
          {overflow.start && (
            <div
              className="w-6 bg-linear-to-r from-background via-background/80 to-transparent [&:dir(rtl)]:bg-linear-to-l"
              data-slot="fixed-toolbar-fade-start"
            />
          )}
          <div
            className={cn(
              'ms-auto flex items-center bg-linear-to-l from-background via-70% via-background/95 to-transparent pe-1 [&:dir(rtl)]:bg-linear-to-r',
              overflow.end ? 'ps-6' : 'ps-3 pointer-coarse:hidden'
            )}
            data-slot="fixed-toolbar-scroll-controls"
          >
            {overflow.start && (
              <Button
                className="pointer-events-auto text-muted-foreground pointer-coarse:hidden"
                aria-label="Scroll toolbar to start"
                size="icon-sm"
                tabIndex={-1}
                type="button"
                variant="ghost"
                onClick={() => scrollToward('start')}
                onMouseDown={(event) => event.preventDefault()}
              >
                <ChevronLeftIcon className="[&:dir(rtl)]:rotate-180" />
              </Button>
            )}
            {overflow.end && (
              <Button
                className="pointer-events-auto text-muted-foreground pointer-coarse:hidden"
                aria-label="Scroll toolbar to end"
                size="icon-sm"
                tabIndex={-1}
                type="button"
                variant="ghost"
                onClick={() => scrollToward('end')}
                onMouseDown={(event) => event.preventDefault()}
              >
                <ChevronRightIcon className="[&:dir(rtl)]:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      )}
      {children}
    </Toolbar>
  );
}

export const FixedToolbarPlugin = definePlugin('fixedToolbar', {
  slots: {
    beforeContainer: () => (
      <FixedToolbar>
        <FixedToolbarButtons />
      </FixedToolbar>
    ),
  },
});

export const FixedToolbarKit = [FixedToolbarPlugin] as const;
