import * as React from 'react';

import type { TResizableProps, TVideoElement } from 'platejs';
import type { PliteElementProps } from 'platejs/static';

import { PliteElement } from 'platejs/static';

import { CaptionStatic } from './caption-static';

export function VideoElementStatic(
  props: PliteElementProps<TVideoElement & TResizableProps>
) {
  const { align = 'center', url, width } = props.element;

  return (
    <PliteElement className="py-2.5" {...props}>
      <div style={{ textAlign: align }}>
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
          <CaptionStatic align={align} element={props.element}>
            {props.children}
          </CaptionStatic>
        </figure>
      </div>
    </PliteElement>
  );
}
