'use client';

import { ChevronRightIcon } from 'lucide-react';
import { BaseDetailsPlugin } from 'platejs/details';
import { DetailsPlugin, DetailsSummaryPlugin } from 'platejs/details/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorPlugin,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DetailsElement(props: PlateElementProps<typeof DetailsPlugin>) {
  const { element, slots } = props;
  const editor = useEditor();
  const detailsKey = editor.key(element);
  const openKeys = usePluginStore(BaseDetailsPlugin, 'openKeys');
  const { api } = useEditorPlugin(BaseDetailsPlugin);
  const open = detailsKey !== undefined && openKeys.has(detailsKey);
  const bodyId = detailsKey === undefined ? undefined : `details-${detailsKey}`;

  return (
    <PlateElement {...props} className="relative my-1 pl-6">
      <Button
        aria-controls={bodyId}
        aria-expanded={open}
        aria-label={open ? 'Collapse details' : 'Expand details'}
        className="absolute top-0 -left-0.5 size-6 rounded-md p-0 text-muted-foreground"
        contentEditable={false}
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

      {slots.children({ from: 0, to: 0 })}

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
    </PlateElement>
  );
}

export function DetailsSummaryElement(
  props: PlateElementProps<typeof DetailsSummaryPlugin>
) {
  return (
    <PlateElement {...props} className="min-h-6 font-medium">
      {props.children}
    </PlateElement>
  );
}

export const DetailsKit = [
  DetailsSummaryPlugin.configure({ component: DetailsSummaryElement }),
  DetailsPlugin.configure({ component: DetailsElement }),
] as const;
