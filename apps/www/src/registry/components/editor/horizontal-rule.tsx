'use client';

import {
  type HorizontalRulePlugin,
  type EditorElementProps,
  EditorElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function HrElement(
  props: EditorElementProps<typeof HorizontalRulePlugin>
) {
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected();
  const focused = useEditorFocused();

  return (
    <EditorElement {...props}>
      <div className="py-6" contentEditable={false}>
        <hr
          className={cn(
            'h-0.5 rounded-sm border-none bg-muted bg-clip-content',
            selected && focused && 'ring-2 ring-ring ring-offset-2',
            !readOnly && 'cursor-pointer'
          )}
        />
      </div>
      {props.children}
    </EditorElement>
  );
}
