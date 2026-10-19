import { BaseDetailsPlugin, BaseDetailsSummaryPlugin } from 'platejs/details';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { headingVariants } from '@/registry/components/editor/heading-static';

export function DetailsElementStatic(
  props: EditorElementProps<typeof BaseDetailsPlugin>
) {
  const { element, slots } = props;

  return (
    <EditorElement {...props} as="details" className="my-1">
      {slots.children({ from: 0, to: 0 })}
      {element.children.length > 1
        ? slots.children({ from: 1, to: element.children.length - 1 })
        : null}
    </EditorElement>
  );
}

export function DetailsSummaryElementStatic(
  props: EditorElementProps<typeof BaseDetailsSummaryPlugin>
) {
  const { level } = props.element;
  const Heading = level ? (`h${level}` as const) : null;
  return (
    <EditorElement {...props} as="summary" className="font-medium">
      {Heading ? (
        <Heading className={cn(headingVariants({ level }), 'm-0 inline')}>
          {props.children}
        </Heading>
      ) : (
        props.children
      )}
    </EditorElement>
  );
}

export const BaseDetailsKit = [
  BaseDetailsSummaryPlugin.configure({
    component: DetailsSummaryElementStatic,
  }),
  BaseDetailsPlugin.configure({ component: DetailsElementStatic }),
] as const;
