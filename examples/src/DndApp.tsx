import React, { useEffect, useRef } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createBasicElementsPlugin,
  createDndPlugin,
  createNodeIdPlugin,
  dndStore,
  DRAG_ITEM_BLOCK,
  DragItemNode,
  Plate,
} from '@udecode/plate';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { getNodesWithId } from './dnd/getNodesWithId';
import { withStyledDraggables } from './dnd/withStyledDraggables';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

// set drag handle next to each block
const components = withStyledDraggables(plateUI);

// set id to each block
const initialValue = getNodesWithId(basicElementsValue);

const SubScroller = ({ type, itemType, height, speed, zIndex }: any) => {
  const [{ isOver }, ref] = useDrop<DragItemNode, unknown, { isOver: boolean }>(
    {
      accept: itemType,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }
  );

  const scrollingRef = useRef<any>(null);

  useEffect(() => {
    if (isOver) {
      // Start scrolling
      const direction = type === 'top' ? -speed : speed;
      // Scroll speed pixels every millisecond.
      scrollingRef.current = setInterval(() => {
        window.scrollBy(0, direction);
      }, 1);
    } else if (scrollingRef.current) {
      // Stop scrolling
      clearInterval(scrollingRef.current);
    }
  }, [isOver, speed, type]);

  // speed is the number of pixels to scroll per millisecond.
  // Drag a fixed, invisible box of custom height at the top, and bottom
  // of the window. Make sure to show it only when dragging something.
  const style: any = {
    position: 'fixed',
    height,
    width: '100%',
    opacity: 0,
    zIndex,
  };

  if (type === 'top') {
    style.top = 0;
  } else if (type === 'bottom') {
    style.bottom = 0;
  }

  // Hide the element if not enabled, so it doesn't interfere with clicking things under it.
  return <div ref={ref} style={style} />;
};

/**
 * Set up a subscroller at the top of the page for scrolling up.
 * One at the bottom for scrolling down.
 */
const Scroller = ({
  itemType,
  enabled = true,
  height = 80,
  speed = 4,
  zIndex = 10000,
}: any) => {
  if (!enabled) return null;

  return (
    <>
      <SubScroller
        type="top"
        height={height}
        speed={speed}
        zIndex={zIndex}
        itemType={itemType}
      />

      <SubScroller
        type="bottom"
        height={height}
        speed={speed}
        zIndex={zIndex}
        itemType={itemType}
      />
    </>
  );
};

export const DndScroller = () => {
  const isDragging = dndStore.use.isDragging();

  return <Scroller itemType={DRAG_ITEM_BLOCK} enabled={isDragging} />;
};

const plugins = createMyPlugins(
  [createBasicElementsPlugin(), createNodeIdPlugin(), createDndPlugin()],
  {
    components,
  }
);

export default () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DndScroller />

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={initialValue}
      />
    </DndProvider>
  );
};
