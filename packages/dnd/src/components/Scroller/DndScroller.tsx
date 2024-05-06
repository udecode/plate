import React from 'react';

import { dndStore } from '../../dndStore';
import { Scroller, type ScrollerProps } from './Scroller';

export function DndScroller(props: Partial<ScrollerProps>) {
  const isDragging = dndStore.use.isDragging();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (isDragging) {
      const timeout = setTimeout(() => {
        setShow(true);
      }, 100);

      return () => clearTimeout(timeout);
    }

    setShow(false);
  }, [isDragging, show]);

  return <Scroller enabled={isDragging && show} {...props} />;
}
