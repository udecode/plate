'use client';

import { FileUp } from 'lucide-react';
import { FilePlugin } from 'platejs/media/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Caption } from './caption';
import { MediaToolbar } from './media-toolbar';

export function FileElement(props: EditorElementProps<typeof FilePlugin>) {
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected({ mode: 'object' });

  return (
    <MediaToolbar
      onPreview={() => {
        window.open(props.element.url, '_blank', 'noopener,noreferrer');
      }}
      plugin={FilePlugin}
      selected={selected}
      placement="top"
    >
      <EditorElement {...props} className="rounded-sm">
        <figure className="group relative m-0 [&>figcaption]:text-left">
          <div className="py-1" contentEditable={false}>
            <a
              className={cn(
                'flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted',
                focused && selected && 'ring-2 ring-ring ring-offset-2'
              )}
              download={props.element.name}
              href={props.element.url}
              rel="noopener noreferrer"
              target="_blank"
              onClick={(event) => {
                // A click in an editable editor selects the file; the second
                // click of a double-click follows the link.
                if (!readOnly && event.detail !== 2) event.preventDefault();
              }}
            >
              <div className={cn('flex items-center gap-1 p-1')}>
                <FileUp className="size-5" />
                <div>{props.element.name}</div>
              </div>
            </a>
          </div>
          <Caption align="left" element={props.element} slots={props.slots}>
            {props.children}
          </Caption>
        </figure>
      </EditorElement>
    </MediaToolbar>
  );
}
