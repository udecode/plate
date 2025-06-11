import * as React from 'react';

import type { SlateElementProps, TLinkElement } from 'platejs';

import { SlateElement } from 'platejs';

export function LinkElementStatic(props: SlateElementProps<TLinkElement>) {
  return (
    <SlateElement
      {...props}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
    >
      {props.children}
    </SlateElement>
  );
}
