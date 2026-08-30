import { BaseDetailsPlugin, BaseDetailsSummaryPlugin } from 'platejs/details';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

export function DetailsElementStatic(
  props: PliteElementProps<typeof BaseDetailsPlugin>
) {
  const { element, slots } = props;

  return (
    <PliteElement {...props} as="details" className="my-1">
      {slots.children({ from: 0, to: 0 })}
      {element.children.length > 1
        ? slots.children({ from: 1, to: element.children.length - 1 })
        : null}
    </PliteElement>
  );
}

export function DetailsSummaryElementStatic(
  props: PliteElementProps<typeof BaseDetailsSummaryPlugin>
) {
  return (
    <PliteElement {...props} as="summary" className="font-medium">
      {props.children}
    </PliteElement>
  );
}

export const BaseDetailsKit = [
  BaseDetailsSummaryPlugin.configure({
    component: DetailsSummaryElementStatic,
  }),
  BaseDetailsPlugin.configure({ component: DetailsElementStatic }),
] as const;
