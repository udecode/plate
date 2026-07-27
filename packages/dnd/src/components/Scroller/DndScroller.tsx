import React from 'react';

import { usePluginStore } from '@platejs/core/react';

import { DndPlugin } from '../../DndPlugin';
import { type ScrollerProps, Scroller } from './Scroller';

export function DndScroller(props: Partial<ScrollerProps>) {
  const isDragging = usePluginStore(DndPlugin, 'isDragging');

  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (isDragging) {
      const timeout = setTimeout(() => {
        setShow(true);
      }, 100);

      return () => clearTimeout(timeout);
    }

    setShow(false);
  }, [isDragging]);

  return <Scroller enabled={isDragging && show} {...props} />;
}
