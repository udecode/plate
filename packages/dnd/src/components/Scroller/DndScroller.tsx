import React, { useEffect } from 'react';
import { dndStore } from '../../dndStore';
import { Scroller, ScrollerProps } from './Scroller';

export const DndScroller = (props: Partial<ScrollerProps>) => {
  const isDragging = dndStore.use.isDragging();
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    if (isDragging) {
      const timeout = setTimeout(() => {
        setShow(true);
      }, 100);
      return () => clearTimeout(timeout);
    }
    setShow(false);
  }, [isDragging, show]);

  return <Scroller enabled={isDragging && show} {...props} />;
};
