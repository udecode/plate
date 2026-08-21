'use client';

import {
  type PlateElementProps,
  type ParagraphPlugin,
  PlateElement,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function ParagraphElement(
  props: PlateElementProps<typeof ParagraphPlugin>
) {
  return (
    <PlateElement {...props} className={cn('m-0 px-0 py-1')}>
      {props.children}
    </PlateElement>
  );
}
