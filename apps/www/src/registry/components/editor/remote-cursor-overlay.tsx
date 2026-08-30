'use client';

import { useEditor, useEditorScrollElement } from 'platejs/react';
import { useYjsRemoteCursorOverlayPositions } from 'platejs/yjs/react';
import * as React from 'react';

type CursorData = {
  color?: unknown;
  name?: unknown;
};
type ContainerOffset = {
  left: number;
  scrollLeft: number;
  scrollTop: number;
  top: number;
};

const FALLBACK_COLORS = ['#7C3AED', '#0891B2', '#DB2777', '#4F46E5'];
const HEX_COLOR = /^#[\dA-Fa-f]{6}$/;
const containerOffsetCache = new WeakMap<object, ContainerOffset>();

const readContainerOffset = (
  container: HTMLElement | null
): ContainerOffset | null => {
  if (!container) return null;

  const rect = container.getBoundingClientRect();
  const previous = containerOffsetCache.get(container);

  if (
    previous?.left === rect.left &&
    previous.top === rect.top &&
    previous.scrollLeft === container.scrollLeft &&
    previous.scrollTop === container.scrollTop
  ) {
    return previous;
  }

  const next = {
    left: rect.left,
    scrollLeft: container.scrollLeft,
    scrollTop: container.scrollTop,
    top: rect.top,
  };

  containerOffsetCache.set(container, next);

  return next;
};

const cursorColor = (clientId: number, data: CursorData | undefined) =>
  typeof data?.color === 'string' && HEX_COLOR.test(data.color)
    ? data.color
    : FALLBACK_COLORS[Math.abs(clientId) % FALLBACK_COLORS.length];

const cursorName = (clientId: number, data: CursorData | undefined) =>
  typeof data?.name === 'string' && data.name.trim().length > 0
    ? data.name
    : `Guest ${clientId}`;

const pointsEqual = (
  left: { offset: number; path: readonly number[]; root?: string },
  right: { offset: number; path: readonly number[]; root?: string }
) =>
  left.offset === right.offset &&
  left.root === right.root &&
  left.path.length === right.path.length &&
  left.path.every((part, index) => part === right.path[index]);

export function RemoteCursorOverlay() {
  const editor = useEditor();
  const [positions] = useYjsRemoteCursorOverlayPositions(editor);
  const container = useEditorScrollElement(editor);
  // useSyncExternalStore requires stable subscription and snapshot functions.
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!container) return () => {};

      container.addEventListener?.('scroll', onStoreChange, { passive: true });
      window.addEventListener('resize', onStoreChange);
      const resizeObserver =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(onStoreChange);
      resizeObserver?.observe(container);

      return () => {
        container.removeEventListener?.('scroll', onStoreChange);
        window.removeEventListener('resize', onStoreChange);
        resizeObserver?.disconnect();
      };
    },
    [container]
  );
  const getSnapshot = React.useCallback(() => {
    void positions;

    return readContainerOffset(container);
  }, [container, positions]);
  const containerOffset = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => null
  );

  if (!container || !containerOffset) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      data-remote-cursor-overlay=""
    >
      {positions.map(({ clientId, cursor, range, rect }) => {
        if (!rect) return null;

        const color = cursorColor(clientId, cursor.data);
        const collapsed = pointsEqual(range.anchor, range.focus);
        const left =
          rect.left - containerOffset.left + containerOffset.scrollLeft;
        const top = rect.top - containerOffset.top + containerOffset.scrollTop;

        return (
          <React.Fragment key={clientId}>
            {!collapsed && (
              <span
                className="absolute rounded-sm opacity-20"
                data-client-id={clientId}
                data-remote-selection=""
                style={{
                  backgroundColor: color,
                  height: Math.max(rect.height, 2),
                  left,
                  top,
                  width: Math.max(rect.width, 2),
                }}
              />
            )}
            <span
              className="absolute w-0.5"
              data-client-id={clientId}
              data-remote-caret=""
              style={{
                backgroundColor: color,
                height: Math.max(rect.height, 16),
                left: collapsed ? left : left + rect.width,
                top,
              }}
            >
              <span
                className="absolute top-0 left-0 -translate-y-full rounded-t-sm rounded-br-sm px-1.5 py-0.5 text-xs whitespace-nowrap text-white"
                data-remote-cursor-label=""
                style={{ backgroundColor: color }}
              >
                {cursorName(clientId, cursor.data)}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
