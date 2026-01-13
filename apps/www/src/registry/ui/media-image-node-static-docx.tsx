import * as React from 'react';

import type { TCaptionProps, TImageElement, TResizableProps } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { NodeApi } from 'platejs';
import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible image component.
 * Uses inline styles and simple HTML structure for proper Word rendering.
 */
export function ImageElementStaticDocx(
  props: SlateElementProps<TImageElement & TCaptionProps & TResizableProps>
) {
  const { align = 'center', caption, url, width } = props.element;

  return (
    <SlateElement {...props}>
      <p
        style={{
          margin: '8pt 0',
          textAlign: align,
        }}
      >
        <img
          alt={(props.attributes as Record<string, string>).alt || ''}
          src={url}
          style={{
            display: 'inline-block',
            height: 'auto',
            maxWidth: '100%',
            ...(width ? { width: `${width}px` } : {}),
          }}
        />
      </p>
      {caption && (
        <p
          style={{
            color: '#666',
            fontSize: '10pt',
            fontStyle: 'italic',
            margin: '4pt 0 8pt 0',
            textAlign: 'center',
          }}
        >
          {NodeApi.string(caption[0])}
        </p>
      )}
      {props.children}
    </SlateElement>
  );
}
