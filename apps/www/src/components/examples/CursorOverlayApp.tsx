import React, { CSSProperties, useRef } from 'react';
import { Plate } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { CursorOverlayContainer } from '@/plate/cursor-overlay/CursorOverlayContainer';
import { cursorOverlayValue } from '@/plate/cursor-overlay/cursorOverlayValue';
import { dragOverCursorPlugin } from '@/plate/cursor-overlay/dragOverCursorPlugin';
import { staticCursors } from '@/plate/cursor-overlay/staticCursors';
import { editableProps } from '@/plate/demo/editableProps';

const styles: Record<string, CSSProperties> = {
  wrapper: { position: 'relative' },
};

export default function CursorOverlayApp() {
  const ref = useRef(null);

  return (
    <div ref={ref} style={styles.wrapper}>
      <Plate
        editableProps={editableProps}
        plugins={[...basicNodesPlugins, dragOverCursorPlugin]}
        initialValue={cursorOverlayValue}
      >
        <CursorOverlayContainer containerRef={ref} cursors={staticCursors} />
      </Plate>
    </div>
  );
}
