import * as React from 'react';

import type { BaseVideoPlugin } from '@platejs/media';
import type { PliteElementProps } from 'platejs/static';

import { PliteElement } from 'platejs/static';

import { CaptionStatic, getMediaTextAlign } from './caption-static';

export function VideoElementStatic(
  props: PliteElementProps<typeof BaseVideoPlugin>
) {
  const { url, width } = props.element;
  const textAlign = getMediaTextAlign(props.element);

  return (
    <PliteElement className="py-2.5" {...props}>
      <div style={{ textAlign }}>
        <figure
          className="group relative m-0 inline-block cursor-default"
          style={{ width }}
        >
          <div>
            <video
              className="w-full max-w-full rounded-sm object-cover px-0"
              src={url}
              controls
            />
          </div>
          <CaptionStatic align={textAlign} element={props.element}>
            {props.children}
          </CaptionStatic>
        </figure>
      </div>
    </PliteElement>
  );
}
