import React, { CSSProperties, useRef } from 'react';
import { Plate } from '@udecode/plate';

import { CursorOverlayContainer } from '@/plate/cursor-overlay/CursorOverlayContainer';
import { editableProps } from '@/plate/demo/editableProps';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { dragOverCursorPlugin } from '@/plate/demo/plugins/dragOverCursorPlugin';
import { cursorOverlayValue } from '@/plate/demo/values/cursorOverlayValue';
import { cursorsData } from '@/plate/demo/values/cursorsData';

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
        <CursorOverlayContainer containerRef={ref} cursors={cursorsData} />
      </Plate>
    </div>
  );
}
