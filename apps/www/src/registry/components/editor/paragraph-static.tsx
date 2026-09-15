import type { BaseParagraphPlugin } from 'platejs';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function ParagraphElementStatic(
  props: EditorElementProps<typeof BaseParagraphPlugin>
) {
  return (
    <EditorElement {...props} className={cn('m-0 px-0 py-1')}>
      {props.children}
    </EditorElement>
  );
}
