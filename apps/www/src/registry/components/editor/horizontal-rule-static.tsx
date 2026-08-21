import type { BaseHorizontalRulePlugin } from '@platejs/basic-nodes';
import type { PliteElementProps } from 'platejs/static';
import { PliteElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function HrElementStatic(
  props: PliteElementProps<typeof BaseHorizontalRulePlugin>
) {
  return (
    <PliteElement {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            'h-0.5 rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {props.children}
    </PliteElement>
  );
}
