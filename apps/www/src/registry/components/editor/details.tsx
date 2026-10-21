'use client';

import { ChevronRightIcon } from 'lucide-react';
import { BaseDetailsPlugin } from 'platejs/details';
import { DetailsPlugin, DetailsSummaryPlugin } from 'platejs/details/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditor,
  useViewStore,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { headingVariants } from '@/registry/components/editor/heading';

export function DetailsElement(
  props: EditorElementProps<typeof DetailsPlugin>
) {
  const { element, slots } = props;
  const editor = useEditor();
  const detailsKey = editor.key(element);
  const { api } = editor.plugin(BaseDetailsPlugin);
  const open = useViewStore(
    BaseDetailsPlugin,
    (state) => detailsKey !== undefined && state.openKeys.has(detailsKey)
  );
  const bodyId = React.useId();
  const { titleRef, toggleRef } = useToggleOnFirstLine();

  return (
    <EditorElement {...props} className="relative my-1 pl-6">
      <div
        ref={titleRef}
        className="relative -ml-6 pl-6"
        data-node-selection-target
      >
        <span
          ref={toggleRef}
          className="absolute top-3 -left-0.5 flex h-6 -translate-y-1/2 items-center"
          contentEditable={false}
        >
          <Button
            aria-controls={bodyId}
            aria-expanded={open}
            aria-label={open ? 'Collapse details' : 'Expand details'}
            className="size-6 rounded-md p-0 text-muted-foreground"
            size="icon"
            type="button"
            variant="ghost"
            onClick={(event) => {
              event.preventDefault();

              if (detailsKey !== undefined) api.setOpen(detailsKey, !open);
            }}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            <ChevronRightIcon
              className={cn(
                'transition-transform duration-75',
                open && 'rotate-90'
              )}
              data-icon
            />
          </Button>
        </span>

        {slots.children({ from: 0, to: 0 })}
      </div>

      <div id={bodyId}>
        {element.children.length > 1
          ? slots.contentBoundary({
              copyPolicy: 'model',
              mounted: open,
              onMaterialize: () => {
                if (detailsKey !== undefined) api.setOpen(detailsKey, true);
              },
              reason: 'app-collapse',
              renderPlaceholder: () => null,
              scope: {
                from: 1,
                to: element.children.length - 1,
                type: 'children',
              },
              selectionPolicy: 'skip',
            })
          : null}
      </div>
    </EditorElement>
  );
}

/**
 * Measures the title's text boxes because a heading level or a font-size mark
 * sets font size on inner elements, which no CSS on the title can read. Writes
 * `style.top` directly because a state update from a ResizeObserver callback
 * commits after the frame paints, leaving the toggle off-center for one frame.
 */
function useToggleOnFirstLine() {
  const titleRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const title = titleRef.current;
    const toggle = toggleRef.current;

    if (!title || !toggle) return undefined;

    const place = () => {
      const line = firstLineExtent(title);

      toggle.style.top = line
        ? `${(line.top + line.bottom) / 2 - title.getBoundingClientRect().top}px`
        : '';
    };

    place();

    const observer = new ResizeObserver(place);

    observer.observe(title);

    return () => observer.disconnect();
  }, []);

  return { titleRef, toggleRef };
}

function firstLineExtent(container: HTMLElement) {
  const range = container.ownerDocument.createRange();
  const walker = container.ownerDocument.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT
  );
  let line: { bottom: number; top: number } | undefined;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const chrome = node.parentElement?.closest('[contenteditable="false"]');

    if (chrome && container.contains(chrome)) continue;

    range.selectNodeContents(node);

    for (const rect of range.getClientRects()) {
      if (rect.height === 0) continue;
      if (!line) {
        line = { bottom: rect.bottom, top: rect.top };
        continue;
      }
      // Under a tight line height, the text boxes of adjacent lines can
      // overlap by a pixel or two.
      if (
        Math.min(line.bottom, rect.bottom) - Math.max(line.top, rect.top) <=
        2
      ) {
        return line;
      }

      line.top = Math.min(line.top, rect.top);
      line.bottom = Math.max(line.bottom, rect.bottom);
    }
  }

  return line;
}

export function DetailsSummaryElement(
  props: EditorElementProps<typeof DetailsSummaryPlugin>
) {
  const { level } = props.element;
  return (
    <EditorElement
      {...props}
      as={level ? `h${level}` : 'div'}
      className={cn(
        'min-h-6 font-medium',
        level && headingVariants({ level }),
        'm-0'
      )}
    >
      {props.children}
    </EditorElement>
  );
}

export const DetailsKit = [
  DetailsSummaryPlugin.configure({ component: DetailsSummaryElement }),
  DetailsPlugin.configure({ component: DetailsElement }),
] as const;
