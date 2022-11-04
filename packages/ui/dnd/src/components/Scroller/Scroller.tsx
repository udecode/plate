import React from 'react';
import { EdgeScroller, EdgeScrollerProps } from './EdgeScroller';

export type ScrollerProps = Omit<EdgeScrollerProps, 'placement'>;
/**
 * Set up an edge scroller at the top of the page for scrolling up.
 * One at the bottom for scrolling down.
 */
export const Scroller = (props: ScrollerProps) => {
  return (
    <>
      <EdgeScroller placement="top" {...props} />
      <EdgeScroller placement="bottom" {...props} />
    </>
  );
};
