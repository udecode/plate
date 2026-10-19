import { FileUp } from 'lucide-react';
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
      <figure className="group relative m-0 [&>figcaption]:text-left">
        <a
          className="flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted"
          download={name}
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="flex items-center gap-1 p-1">
            <FileUp className="size-5" />
            <div>{name}</div>
          </div>
        </a>
        <CaptionStatic align="left" element={props.element}>
          {props.children}
        </CaptionStatic>
      </figure>
    </EditorElement>
  );
}
