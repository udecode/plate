import React from 'react';

import { ScrollArea, ScrollAreaProps } from './ScrollArea';

export type ScrollerProps = Omit<ScrollAreaProps, 'placement'>;
/**
 * Set up an edge scroller at the top of the page for scrolling up.
 * One at the bottom for scrolling down.
 */
export function Scroller(props: ScrollerProps) {
  return (
    <>
      <ScrollArea placement="top" {...props} />
      <ScrollArea placement="bottom" {...props} />
    </>
  );
}
