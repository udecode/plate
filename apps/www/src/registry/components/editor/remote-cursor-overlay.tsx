'use client';

import { cn } from 'cn';
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

const LABEL_INSET = 4;

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
  const [labelSize, setLabelSize] = React.useState({ height: 0, width: 0 });
  const name = cursorName(clientId, cursor?.data);
  const clipRect =
    cursor?.selection && geometry?.visible?.focusRect
      ? geometry.clipRect
      : null;

  React.useLayoutEffect(() => {
    const label = labelRef.current;

    if (!label) return;

    const { height, width } = label.getBoundingClientRect();

    setLabelSize((current) =>
      current.height === height && current.width === width
        ? current
        : { height, width }
    );
  }, [name, clipRect?.width]);

  if (!cursor || !clipRect || !geometry?.focusRect) return null;

  const { focusRect } = geometry;
  const color = cursorColor(clientId, cursor.data);
  const caretTop = focusRect.top - clipRect.top;
  const caretLeft = focusRect.left - clipRect.left;
  const caretHeight = Math.max(focusRect.height, 16);
  const labelAbove = caretTop >= labelSize.height;
  const labelLeft = Math.min(
    Math.max(caretLeft, LABEL_INSET),
    Math.max(LABEL_INSET, clipRect.width - labelSize.width - LABEL_INSET)
  );

  return (
    <div
      className="pointer-events-none fixed overflow-hidden"
      data-remote-cursor-clip=""
      style={{
        height: clipRect.height,
        left: clipRect.left,
        top: clipRect.top,
        width: clipRect.width,
      }}
    >
      <span
        className="absolute w-0.5"
        data-client-id={clientId}
        data-remote-caret=""
        style={{
          backgroundColor: color,
          height: caretHeight,
          left: caretLeft,
          top: caretTop,
        }}
      />
      <span
        ref={labelRef}
        className={cn(
          'absolute truncate px-1.5 py-0.5 text-xs text-white',
          labelAbove
            ? 'rounded-t-sm [border-bottom-right-radius:var(--radius-sm)]'
            : 'rounded-b-sm [border-top-right-radius:var(--radius-sm)]'
        )}
        data-remote-cursor-label=""
        style={{
          backgroundColor: color,
          left: labelLeft,
          maxWidth: clipRect.width - 2 * LABEL_INSET,
          top: labelAbove
            ? caretTop - labelSize.height
            : caretTop + caretHeight,
        }}
      >
        {name}
      </span>
    </div>
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
