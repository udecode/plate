import type { BaseVideoPlugin } from 'platejs/media';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

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
            {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- [P0 behavior-boundary] User media has no caption-track field; an empty fabricated track would falsely claim accessibility. */}
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
