'use client';

import { FileUp } from 'lucide-react';
import type { FilePlugin } from 'platejs/media/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditorFocused,
  useElementSelected,
  usePath,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';

export function FileElement(props: EditorElementProps<typeof FilePlugin>) {
  const path = usePath();
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'node' });
  const captionFocused = useCaptionFocused(path);

  return (
    <EditorElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-node-selection-highlight': 'self',
      }}
      className="my-px rounded-sm"
    >
      <figure className="group relative m-0 [&>figcaption]:text-left">
        <div contentEditable={false}>
          <a
            className={cn(
              'flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted',
              focused && selected && 'ring-2 ring-ring ring-offset-2'
            )}
            download={props.element.name}
            href={props.element.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className={cn('flex items-center gap-1 p-1')}>
              <FileUp className="size-5" />
              <div>{props.element.name}</div>
            </div>
          </a>
        </div>
        <Caption
          active={selected || captionFocused}
          align="left"
          element={props.element}
          slots={props.slots}
        >
          {props.children}
        </Caption>
      </figure>
    </EditorElement>
  );
}
