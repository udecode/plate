import React, { CSSProperties, useRef } from 'react';
import { Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { CursorOverlayContainer } from './cursor-overlay/CursorOverlayContainer';
import { cursorOverlayValue } from './cursor-overlay/cursorOverlayValue';

const staticCursors = {
  one: {
    key: 'one',
    data: { style: { backgroundColor: 'red' } },
    selection: {
      anchor: {
        path: [0, 0],
        offset: 5,
      },
      focus: {
        path: [0, 0],
        offset: 12,
      },
    },
  },
  two: {
    key: 'two',
    data: { style: { backgroundColor: 'red' } },
    selection: {
      anchor: {
        path: [0, 0],
        offset: 18,
      },
      focus: {
        path: [0, 0],
        offset: 18,
      },
    },
  },
};

const styles: Record<string, CSSProperties> = {
  wrapper: { position: 'relative' },
};

export default () => {
  const ref = useRef(null);

  return (
    <div ref={ref} style={styles.wrapper}>
      <Plate
        editableProps={editableProps}
        plugins={basicNodesPlugins}
        initialValue={cursorOverlayValue}
      >
        <CursorOverlayContainer containerRef={ref} cursors={staticCursors} />
      </Plate>
    </div>
  );
};
