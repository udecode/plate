import type { BaseFilePlugin } from 'platejs/media';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { CaptionStatic } from './caption-static';

export function FileElementStatic(
  props: EditorElementProps<typeof BaseFilePlugin>
) {
  const { name, url } = props.element;

  return (
    <EditorElement className="my-px rounded-sm" {...props}>
      <figure className="group relative m-0 [&>figcaption]:text-start">
        <a
          aria-label={name || 'Download file'}
          className="flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted"
          download={name}
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="flex items-center gap-1 p-1">
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M12 12v6" />
              <path d="m15 15-3-3-3 3" />
            </svg>
            <div>{name}</div>
          </div>
        </a>
        <CaptionStatic align="start" element={props.element}>
          {props.children}
        </CaptionStatic>
      </figure>
    </EditorElement>
  );
}
