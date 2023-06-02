import React, { CSSProperties, useRef } from 'react';
import { Plate } from '@udecode/plate';

import { CursorOverlay } from '@/plate/aui/cursor-overlay';
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
        <CursorOverlay containerRef={ref} cursors={cursorsData} />
      </Plate>
    </div>
  );
}
