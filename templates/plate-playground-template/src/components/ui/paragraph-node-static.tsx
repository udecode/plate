import * as React from 'react';

import type { SlateElementProps } from 'platejs';

import { SlateElement } from 'platejs';

import { cn } from '@/lib/utils';

export function ParagraphElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props} className={cn('m-0 px-0 py-1')}>
      {props.children}
    </SlateElement>
  );
}
