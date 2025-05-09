'use client';

import { type PlateElementProps, PlateElement } from '@udecode/plate/react';

export function AIAnchorElement(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <div className="h-[0.1px]" />
    </PlateElement>
  );
}
