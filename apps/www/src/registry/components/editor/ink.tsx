'use client';

import type { InkTool } from 'platejs/ink';
import { InkContent, InkPlugin } from 'platejs/ink/react';
import { useViewStore } from 'platejs/react';
import type * as React from 'react';

import { InkDock } from '@/registry/components/editor/ink-dock';
import { InkSignButton } from '@/registry/components/editor/ink-sign-button';

const svgCursor = (svg: string, x: number, y: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, crosshair`;

const inkCursorFor = (tool: InkTool | null) => {
  if (!tool) return undefined;
  if (tool.type === 'lasso') return 'crosshair';
  if (tool.type === 'erase') {
    const side = Math.min(48, Math.max(8, Math.round(tool.size)));
    const middle = side / 2;

    return svgCursor(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}"><circle cx="${middle}" cy="${middle}" r="${middle - 1}" fill="rgba(255,255,255,0.55)" stroke="#52525b" stroke-width="1"/></svg>`,
      middle,
      middle
    );
  }

  const { color, opacity } = tool.brush;

  if (opacity < 1) {
    return svgCursor(
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="4" y="7" width="12" height="6" rx="1.5" fill="${color}" fill-opacity="${opacity}" stroke="#52525b" stroke-opacity="0.6"/></svg>`,
      10,
      10
    );
  }

  return svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3.5" fill="${color}" stroke="#ffffff" stroke-width="1.5"/></svg>`,
    8,
    8
  );
};

function InkLayerContent(props: { children: React.ReactNode }) {
  const tool = useViewStore(InkPlugin, (state) => state.tool);

  return (
    <InkContent
      {...props}
      sign={InkSignButton}
      style={{ '--ink-cursor': inkCursorFor(tool) } as React.CSSProperties}
    />
  );
}

export const InkKit = [
  InkPlugin.configure({
    slots: {
      afterEditable: InkDock,
      wrapContent: InkLayerContent,
    },
  }),
];
