import React from 'react';
import { dndStore } from '../../dndStore';
import { Scroller, ScrollerProps } from './Scroller';

export const DndScroller = (props: Partial<ScrollerProps>) => {
  const isDragging = dndStore.use.isDragging();

  return <Scroller enabled={isDragging} {...props} />;
};
