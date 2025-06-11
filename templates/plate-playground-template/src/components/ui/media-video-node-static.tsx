import * as React from 'react';

import type {
  SlateElementProps,
  TCaptionElement,
  TResizableProps,
  TVideoElement,
} from 'platejs';

import { NodeApi, SlateElement } from 'platejs';

export function VideoElementStatic(
  props: SlateElementProps<TVideoElement & TCaptionElement & TResizableProps>
) {
  const { align = 'center', caption, url, width } = props.element;

  return (
    <SlateElement className="py-2.5" {...props}>
      <div style={{ textAlign: align }}>
        <figure
          className="group relative m-0 inline-block cursor-default"
          style={{ width }}
        >
          <video
            className="w-full max-w-full rounded-sm object-cover px-0"
            src={url}
            controls
          />
          {caption && <figcaption>{NodeApi.string(caption[0])}</figcaption>}
        </figure>
      </div>
      {props.children}
    </SlateElement>
  );
}
