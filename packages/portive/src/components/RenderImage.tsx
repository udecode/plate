import React from 'react';
import {
  JotaiProvider,
  PlateRenderElementProps,
  Value,
} from '@udecode/plate-core';
import { TPortiveImageElement } from '../createPortivePlugin';
import { HostedImage } from './HostedImage';

export function RenderHostedImage({
  attributes,
  element,
  children,
}: PlateRenderElementProps<Value, TPortiveImageElement>) {
  return (
    <div {...attributes} style={{ margin: '8px 0' }}>
      <JotaiProvider scope="hostedImage">
        <HostedImage
          element={element}
          style={{
            borderRadius: element.size
              ? element.size[0] < 100
                ? 0
                : 4
              : undefined,
          }}
        />
      </JotaiProvider>
      {children}
    </div>
  );
}
