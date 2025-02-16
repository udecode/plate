import React from 'react';

import { usePluginOption } from '@udecode/plate/react';

import { DndPlugin } from '../../DndPlugin';
import { type ScrollerProps, Scroller } from './Scroller';

export function DndScroller(props: Partial<ScrollerProps>) {
  const isDragging = usePluginOption(DndPlugin, 'isDragging');

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
