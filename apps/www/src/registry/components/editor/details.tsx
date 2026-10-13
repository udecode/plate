'use client';

import { ChevronRightIcon } from 'lucide-react';
import { BaseDetailsPlugin } from 'platejs/details';
import { DetailsPlugin, DetailsSummaryPlugin } from 'platejs/details/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorSelector,
  usePluginStore,
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
  const openKeys = usePluginStore(BaseDetailsPlugin, 'openKeys');
  const { api } = useEditor().plugin(BaseDetailsPlugin);
  const open = detailsKey !== undefined && openKeys.has(detailsKey);
  const bodyId = React.useId();
  const titleLevel = useEditorSelector((current) => {
    if (detailsKey === undefined) return;

    const path = current.read.nodes.get(detailsKey)?.[1];

    if (!path) return;

    return current.read.nodes.get([...path, 0], {
      type: DetailsSummaryPlugin,
    })?.[0].level;
  });

  return (
    <EditorElement {...props} className="relative my-1 pl-6">
      <div className="relative -ml-6 pl-6" data-node-selection-target>
        <DetailsToggleLine level={titleLevel}>
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
        </DetailsToggleLine>

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

function DetailsToggleLine({
  children,
  level,
}: {
  children: React.ReactNode;
  level: EditorElementProps<typeof DetailsSummaryPlugin>['element']['level'];
}) {
  return (
    <span
      className={cn(
        'flex h-6 items-center',
        level && headingVariants({ level }),
        level && 'h-[1lh]',
        'absolute top-0 -left-0.5 m-0 p-0'
      )}
      contentEditable={false}
    >
      {children}
    </span>
  );
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
