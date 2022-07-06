export const cursorOverlayAppCode = `import React, { CSSProperties, useRef } from 'react';
import { Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { CursorOverlayContainer } from './cursor-overlay/CursorOverlayContainer';
import { cursorOverlayValue } from './cursor-overlay/cursorOverlayValue';
import { dragOverCursorPlugin } from './cursor-overlay/dragOverCursorPlugin';
import { staticCursors } from './cursor-overlay/staticCursors';

const styles: Record<string, CSSProperties> = {
  wrapper: { position: 'relative' },
};

export default () => {
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
};
`;

export const cursorOverlayAppFile = {
  '/CursorOverlayApp.tsx': cursorOverlayAppCode,
};
