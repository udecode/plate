import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible paragraph component.
 * Uses <p> tag instead of <div> for proper inline element handling in html-to-docx.
 */
export function ParagraphElementStaticDocx(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="p"
      style={{
        margin: '0 0 8pt 0',
      }}
    >
      {props.children}
    </SlateElement>
  );
}
