'use client';

import type { EditableSiblingProps } from 'platejs/react';
import {
  YjsPlugin,
  useYjsRemoteCursor,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from 'platejs/yjs/react';
import React from 'react';

type CursorData = {
  color?: unknown;
  name?: unknown;
};

type CursorEditor = Parameters<typeof useYjsRemoteCursor>[0];

const FALLBACK_COLORS = ['#7C3AED', '#0891B2', '#DB2777', '#4F46E5'];
const HEX_COLOR = /^#[\dA-Fa-f]{6}$/;

const cursorColor = (clientId: number, data: CursorData | undefined) =>
  typeof data?.color === 'string' && HEX_COLOR.test(data.color)
    ? data.color
    : FALLBACK_COLORS[Math.abs(clientId) % FALLBACK_COLORS.length];

const cursorName = (clientId: number, data: CursorData | undefined) =>
  typeof data?.name === 'string' && data.name.trim().length > 0
    ? data.name
    : `Guest ${clientId}`;

/** Creates Yjs collaboration with copied selection, caret, and label UI. */
export const CollaborationPlugin = YjsPlugin.require('awareness').map(
  ({ api, editor }) => ({
    decorate: {
      attributes: ({ decoration }) => {
        const clientId = Number(decoration.key);
        const cursor = api.remoteCursor(clientId);

        return {
          style: {
            backgroundColor: `${cursorColor(clientId, cursor?.data)}33`,
          },
        };
      },
    },
    slots: {
      afterEditable: ({ editableRef }) => (
        <RemoteCursorOverlay editableRef={editableRef} editor={editor} />
      ),
    },
  })
);

function RemoteCursor({
  clientId,
  editableRef,
  editor,
}: EditableSiblingProps & {
  readonly clientId: number;
  readonly editor: CursorEditor;
}) {
  const cursor = useYjsRemoteCursor(editor, clientId);
  const geometry = useYjsRemoteCursorGeometry(editor, clientId, {
    editableRef,
  });
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [labelOffset, setLabelOffset] = React.useState(0);
  const focusLeft = geometry?.focusRect?.left ?? null;
  const name = cursorName(clientId, cursor?.data);

  React.useLayoutEffect(() => {
    const label = labelRef.current;

    if (!label || focusLeft === null) return;

    const inset = 4;
    const viewportWidth = label.ownerDocument.documentElement.clientWidth;
    const labelWidth = label.getBoundingClientRect().width;
    const maxLeft = Math.max(inset, viewportWidth - labelWidth - inset);
    const nextLeft = Math.min(Math.max(focusLeft, inset), maxLeft);
    const nextOffset = nextLeft - focusLeft;

    setLabelOffset((current) =>
      current === nextOffset ? current : nextOffset
    );
  }, [focusLeft, name]);

  if (!cursor?.selection || !geometry?.focusRect) return null;

  const color = cursorColor(clientId, cursor.data);
  const { focusRect } = geometry;

  return (
    <span
      className="pointer-events-none fixed w-0.5"
      data-client-id={clientId}
      data-remote-caret=""
      style={{
        backgroundColor: color,
        height: Math.max(focusRect.height, 16),
        left: focusRect.left,
        top: focusRect.top,
      }}
    >
      <span
        ref={labelRef}
        className="absolute top-0 left-0 max-w-[calc(100vw-0.5rem)] truncate rounded-t-sm rounded-br-sm px-1.5 py-0.5 text-xs text-white"
        data-remote-cursor-label=""
        style={{
          backgroundColor: color,
          transform: `translate(${labelOffset}px, -100%)`,
        }}
      >
        {name}
      </span>
    </span>
  );
}

export function RemoteCursorOverlay({
  editableRef,
  editor,
}: EditableSiblingProps & { readonly editor: CursorEditor }) {
  const clientIds = useYjsRemoteCursorIds(editor);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      data-remote-cursor-overlay=""
    >
      {clientIds.map((clientId) => (
        <RemoteCursor
          clientId={clientId}
          editableRef={editableRef}
          editor={editor}
          key={clientId}
        />
      ))}
    </div>
  );
}
