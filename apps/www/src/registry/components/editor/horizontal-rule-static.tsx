import type { BaseHorizontalRulePlugin } from 'platejs';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function HrElementStatic(
  props: EditorElementProps<typeof BaseHorizontalRulePlugin>
) {
  return (
    <EditorElement {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            'h-0.5 rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {props.children}
    </EditorElement>
  );
}
