// Lifted from slate-yjs https://github.com/BitPhinix/slate-yjs/blob/main/examples/frontend/src/pages/RemoteCursorOverlay/Overlay.tsx

import React, { type CSSProperties, useState } from 'react';

import {
  type CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from '@slate-yjs/react';
import { useEditorContainerRef } from '@udecode/plate-common/react';

export function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);

  return hexColor + normalized.toString(16).toUpperCase();
}

export type CursorData = {
  color: string;
  name: string;
};

type CaretProps = Pick<CursorOverlayData<CursorData>, 'caretPosition' | 'data'>;
const cursorOpacity = 0.7;
const hoverOpacity = 1;

function Caret({ caretPosition, data }: CaretProps) {
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const caretStyle: CSSProperties = {
    ...caretPosition,
    background: data?.color,
    opacity: cursorOpacity,
    transition: 'opacity 0.2s',
  };
  const caretStyleHover = { ...caretStyle, opacity: hoverOpacity };

  const labelStyle: CSSProperties = {
    background: data?.color,
    opacity: cursorOpacity,
    transform: 'translateY(-100%)',
    transition: 'opacity 0.2s',
  };
  const labelStyleHover = { ...labelStyle, opacity: hoverOpacity };

  return (
    <div
      className="absolute w-0.5"
      style={isHover ? caretStyleHover : caretStyle}
    >
      <div
        className="absolute top-0 whitespace-nowrap rounded rounded-bl-none px-1.5 py-0.5 text-xs text-white"
        style={isHover ? labelStyleHover : labelStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {data?.name}
      </div>
    </div>
  );
}

function RemoteSelection({
  caretPosition,
  data,
  selectionRects,
}: CursorOverlayData<CursorData>) {
  if (!data) {
    return null;
  }

  const selectionStyle: CSSProperties = {
    // Add a opacity to the background color
    backgroundColor: addAlpha(data.color, 0.5),
  };

  return (
    <React.Fragment>
      {selectionRects.map((position, i) => (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{ ...selectionStyle, ...position }}
        ></div>
      ))}
      {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
    </React.Fragment>
  );
}

export function RemoteCursorOverlay() {
  const containerRef = useEditorContainerRef();
  const [cursors] = useRemoteCursorOverlayPositions<CursorData>({
    containerRef,
  });

  return (
    <>
      {cursors.map((cursor) => (
        <RemoteSelection key={cursor.clientId} {...cursor} />
      ))}
    </>
  );
}
