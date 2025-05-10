import * as React from 'react';

import type { SlateElementProps } from '@udecode/plate';
import type { TCaptionElement } from '@udecode/plate-caption';
import type { TVideoElement } from '@udecode/plate-media';

import { NodeApi, SlateElement } from '@udecode/plate';

export function MediaVideoElementStatic(
  props: SlateElementProps<TVideoElement & TCaptionElement & { width: number }>
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
