import * as React from 'react';

import type { PliteElementProps } from 'platejs/static';

import { PliteElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function ParagraphElementStatic(props: PliteElementProps) {
  return (
    <PliteElement {...props} className={cn('m-0 px-0 py-1')}>
      {props.children}
    </PliteElement>
  );
}
