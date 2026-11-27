'use client';

import {
  EraserIcon,
  HighlighterIcon,
  LassoIcon,
  PenToolIcon,
} from 'lucide-react';
import { type Editor, getEditorRuntimeOwner } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import type { InkBrush, InkTool } from 'platejs/ink';
import { InkPlugin } from 'platejs/ink/react';
import { useEditor, useEditorSelector, useViewStore } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export type InkToolKind = 'eraser' | 'highlighter' | 'lasso' | 'pen';

/** The brush each Draw tool comes back with, shared by every view of one editor. */
export type InkBrushPrefs = Readonly<{
  eraserSize: number;
  highlighter: InkBrush;
  lastKind: InkToolKind;
  pen: InkBrush;
}>;

export const INK_PEN_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Orange', value: '#ea580c' },
] as const;

export const INK_HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#facc15' },
  { label: 'Green', value: '#4ade80' },
  { label: 'Sky', value: '#38bdf8' },
  { label: 'Pink', value: '#f472b6' },
] as const;

export const INK_PEN_SIZES = [1.5, 2.5, 4] as const;
export const INK_HIGHLIGHT_SIZES = [12, 16, 22] as const;
export const INK_ERASER_SIZES = [12, 16, 24] as const;

const DEFAULT_PREFS: InkBrushPrefs = Object.freeze({
  eraserSize: INK_ERASER_SIZES[1],
  highlighter: Object.freeze({
    color: INK_HIGHLIGHT_COLORS[0].value,
    opacity: 0.4,
    size: INK_HIGHLIGHT_SIZES[1],
  }),
  lastKind: 'pen',
  pen: Object.freeze({
    color: INK_PEN_COLORS[0].value,
    opacity: 1,
    size: INK_PEN_SIZES[1],
  }),
});

type BrushEntry = { listeners: Set<() => void>; prefs: InkBrushPrefs };

const brushEntries = new WeakMap<object, BrushEntry>();

const brushEntry = (owner: object) => {
  let entry = brushEntries.get(owner);

  if (!entry) {
    entry = { listeners: new Set(), prefs: DEFAULT_PREFS };
    brushEntries.set(owner, entry);
  }

  return entry;
};

const sameBrush = (a: InkBrush, b: InkBrush) =>
  a.color === b.color && a.opacity === b.opacity && a.size === b.size;

const samePrefs = (a: InkBrushPrefs, b: InkBrushPrefs) =>
  a.eraserSize === b.eraserSize &&
  a.lastKind === b.lastKind &&
  sameBrush(a.highlighter, b.highlighter) &&
  sameBrush(a.pen, b.pen);

/** Which dock tool `tool` is: a see-through brush is the highlighter. */
export const classifyInkToolKind = (tool: InkTool): InkToolKind => {
  if (tool.type === 'erase') return 'eraser';
  if (tool.type === 'lasso') return 'lasso';

  return tool.brush.opacity < 1 ? 'highlighter' : 'pen';
};

/** The Draw tool for `kind` with the brush `prefs` remembers for it. */
export const toolForInkKind = (
  prefs: InkBrushPrefs,
  kind: InkToolKind
): InkTool => {
  if (kind === 'eraser') return { size: prefs.eraserSize, type: 'erase' };
  if (kind === 'lasso') return { type: 'lasso' };

  return { brush: prefs[kind], type: 'draw' };
};

/** The brush preferences of the editor `editor` belongs to. */
export const getInkBrushPrefs = (editor: Editor): InkBrushPrefs =>
  brushEntry(getEditorRuntimeOwner(editor)).prefs;

/** Replace the editor's brush preferences with what `update` returns. */
export const updateInkBrushPrefs = (
  editor: Editor,
  update: (prefs: InkBrushPrefs) => InkBrushPrefs
) => {
  const entry = brushEntry(getEditorRuntimeOwner(editor));
  const next = update(entry.prefs);

  if (samePrefs(next, entry.prefs)) return;

  entry.prefs = Object.freeze({
    ...next,
    highlighter: Object.freeze({ ...next.highlighter }),
    pen: Object.freeze({ ...next.pen }),
  });
  for (const listener of entry.listeners) listener();
};

const rememberTool = (editor: Editor, tool: InkTool) => {
  const kind = classifyInkToolKind(tool);

  updateInkBrushPrefs(editor, (prefs) => {
    if (tool.type === 'erase') {
      return { ...prefs, eraserSize: tool.size, lastKind: kind };
    }
    if (tool.type === 'lasso') return { ...prefs, lastKind: kind };

    return kind === 'pen'
      ? { ...prefs, lastKind: kind, pen: tool.brush }
      : { ...prefs, highlighter: tool.brush, lastKind: kind };
  });
};

/**
 * Subscribe to the brush preferences of the current editor. A tool another
 * caller sets on this view through `setTool` becomes the remembered one.
 */
export function useInkBrushPrefs(): InkBrushPrefs {
  const editor = useEditor();
  const owner = getEditorRuntimeOwner(editor);
  const subscribe = React.useCallback(
    (listener: () => void) => {
      const entry = brushEntry(owner);

      entry.listeners.add(listener);

      return () => {
        entry.listeners.delete(listener);
      };
    },
    [owner]
  );
  const getSnapshot = React.useCallback(() => brushEntry(owner).prefs, [owner]);

  React.useEffect(() => {
    const tools = editor.plugin(InkPlugin).viewStore;
    const current = tools.get('tool');

    if (current) rememberTool(editor, current);

    return tools.subscribe((state, previous) => {
      if (state.tool && state.tool !== previous.tool) {
        rememberTool(editor, state.tool);
      }
    });
  }, [editor]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const KIND_ICONS = {
  eraser: <EraserIcon />,
  highlighter: <HighlighterIcon />,
  lasso: <LassoIcon />,
  pen: <PenToolIcon />,
} as const;

export function DrawToolbarButton() {
  const editor = useEditor();
  const prefs = useInkBrushPrefs();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const disabled = useEditorSelector(
    (current) => {
      if (current.read.view.isReadOnly()) return true;

      const authored = current.plugin(AuthoredPlugin);

      return authored.installed && 'preview' in authored.read.view();
    },
    { dependsOn: ['readOnly', 'authored'] }
  );
  const on = tool !== null;

  return (
    <ToolbarButton
      aria-label="Draw"
      disabled={disabled}
      onClick={() => {
        const latest = getInkBrushPrefs(editor);

        editor
          .plugin(InkPlugin)
          .api.setTool(on ? null : toolForInkKind(latest, latest.lastKind));
      }}
      pressed={on}
      tooltip="Draw"
    >
      {KIND_ICONS[prefs.lastKind]}
    </ToolbarButton>
  );
}
