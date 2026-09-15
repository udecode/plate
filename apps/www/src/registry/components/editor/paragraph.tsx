'use client';

import {
  type EditorElementProps,
  type ParagraphPlugin,
  EditorElement,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function ParagraphElement(
  props: EditorElementProps<typeof ParagraphPlugin>
) {
  return (
    <EditorElement {...props} className={cn('m-0 px-0 py-1')}>
      {props.children}
    </EditorElement>
  );
}
