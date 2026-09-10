import { expect, spyOn, test } from 'bun:test';

import { act, render } from '@testing-library/react';
import { defineEditorSchema, schema } from 'platejs';
import { DndPlugin } from 'platejs/dnd/react';
import { createEditor, ParagraphPlugin, Plate } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import React from 'react';
import { DndProvider, useDragDropManager } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Editor } from '@/registry/components/editor/editor';

import { DndKit } from './dnd';

function DndView({ visible = true }: { visible?: boolean }) {
  return visible && <Editor data-testid="editable" />;
}
function listeners(targetDocument: Document = document) {
  const active = new Map<EventListenerOrEventListenerObject, Set<string>>();
  const add = targetDocument.addEventListener.bind(targetDocument);
  const remove = targetDocument.removeEventListener.bind(targetDocument);
  const matches = (fn: EventListenerOrEventListenerObject | null) =>
    typeof fn === 'function' &&
    ['handleDragLeave', 'handleDrop', 'deactivate'].includes(fn.name);
  const addSpy = spyOn(targetDocument, 'addEventListener').mockImplementation(
    (...[type, fn, options]: Parameters<Document['addEventListener']>) => {
      if (fn && matches(fn)) {
        const keys = active.get(fn) ?? new Set<string>();
        keys.add(`${type}:${options === true}`);
        active.set(fn, keys);
      }
      return add(type, fn, options);
    }
  );
  const removeSpy = spyOn(
    targetDocument,
    'removeEventListener'
  ).mockImplementation(
    (...[type, fn, options]: Parameters<Document['removeEventListener']>) => {
      if (fn && matches(fn)) {
        active.get(fn)?.delete(`${type}:${options === true}`);
        if (!active.get(fn)?.size) active.delete(fn);
      }
      return remove(type, fn, options);
    }
  );
  return {
    count: () => [...active.values()].reduce((sum, keys) => sum + keys.size, 0),
    restore() {
      addSpy.mockRestore();
      removeSpy.mockRestore();
    },
  };
}

test('automatic DndKit reuses an application-supplied manager', () => {
  let supplied: ReturnType<typeof useDragDropManager> | undefined;
  let inherited: typeof supplied;
  function Capture({ inside = false }: { inside?: boolean }) {
    const manager = useDragDropManager();
    if (inside) inherited = manager;
    else supplied = manager;
    return null;
  }
  const editor = createEditor({
    plugins: [
      ParagraphPlugin,
      ...DndKit,
      DndPlugin.configure({
        slots: { afterEditable: () => <Capture inside /> },
      }),
    ],
  });
  const view = render(
    <DndProvider backend={HTML5Backend} context={{}}>
      <Capture />
      <Plate editor={editor}>
        <Editor />
      </Plate>
    </DndProvider>
  );
  try {
    expect(supplied).toBeDefined();
    expect(inherited).toBe(supplied);
  } finally {
    view.unmount();
  }
});

test('DndKit tracks its exact view across StrictMode, custom slots, readonly and scroller changes', () => {
  const tracked = listeners();
  const editor = createEditor({
    plugins: [
      ParagraphPlugin,
      ...DndKit,
      DndPlugin.configure(({ plugin }) => {
        const Integration = plugin.slots.wrapRoot;
        if (!Integration) throw new Error('Expected DnD root integration');

        return {
          slots: {
            wrapRoot: (props) => (
              <Integration {...props}>
                <section data-testid="custom-root">{props.children}</section>
              </Integration>
            ),
            afterEditable: () => <span data-testid="custom-after" />,
          },
        };
      }),
    ],
  });
  const assembly = (visible: boolean, readOnly = false) => (
    <React.StrictMode>
      <Plate editor={editor} readOnly={readOnly}>
        <DndView visible={visible} />
      </Plate>
    </React.StrictMode>
  );
  const view = render(assembly(false));
  try {
    expect(tracked.count()).toBe(0);
    view.rerender(assembly(true));
    expect(view.getByTestId('custom-root')).toBeTruthy();
    expect(view.getByTestId('custom-after')).toBeTruthy();
    expect(tracked.count()).toBe(5);
    view.rerender(assembly(true, true));
    act(() =>
      editor
        .plugin(DndPlugin)
        .store.set({ enableScroller: false, _isOver: true })
    );
    act(() => {
      document.dispatchEvent(new Event('drop'));
    });
    expect(editor.plugin(DndPlugin).store.get('_isOver')).toBe(false);
    expect(tracked.count()).toBe(5);
    view.rerender(assembly(false));
    expect(tracked.count()).toBe(0);
    view.rerender(assembly(true));
    expect(tracked.count()).toBe(5);
  } finally {
    view.unmount();
    expect(tracked.count()).toBe(0);
    tracked.restore();
  }
});

test('empty root readiness attaches and detaches all five DnD listeners with actual Editor DOM', () => {
  const tracked = listeners();
  const EmptyAllowed = defineEditorSchema('schema:dnd-lifetime', {
    elements: {
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    },
    root: schema.content.type('paragraph', { min: 0 }),
    unknown: 'reject',
  });
  const editor = createEditor({
    extensions: [EmptyAllowed],
    plugins: [ParagraphPlugin, ...DndKit],
    initialValue: [{ type: 'paragraph', children: [{ text: 'initial' }] }],
  });
  editor.update.nodes.remove({ at: [0] });
  const assembly = () => (
    <Plate editor={editor}>
      <DndView />
    </Plate>
  );
  const view = render(assembly());
  try {
    expect(view.queryByTestId('editable')).toBeNull();
    expect(tracked.count()).toBe(0);
    act(() =>
      editor.update.nodes.insert(
        { type: 'paragraph', children: [{ text: 'ready' }] },
        { at: [0] }
      )
    );
    view.rerender(assembly());
    expect(view.getByTestId('editable')).toBeTruthy();
    expect(tracked.count()).toBe(5);
    act(() => editor.update.nodes.remove({ at: [0] }));
    view.rerender(assembly());
    expect(view.queryByTestId('editable')).toBeNull();
    expect(tracked.count()).toBe(0);
  } finally {
    view.unmount();
    tracked.restore();
  }
});

test('table selection hides only its own editor handles across detach and remount', () => {
  const makeEditor = () =>
    createEditor({
      plugins: [ParagraphPlugin, BaseTablePlugin, ...DndKit],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Outside table' }] },
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: ['First', 'Second'].map((text) => ({
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text }] }],
              })),
            },
          ],
        },
      ],
    });
  const first = makeEditor();
  const second = makeEditor();
  const assembly = (showFirst = true) => (
    <>
      {showFirst && (
        <section data-testid="first-editor">
          <Plate editor={first}>
            <Editor />
          </Plate>
        </section>
      )}
      <section data-testid="second-editor">
        <Plate editor={second}>
          <Editor />
        </Plate>
      </section>
    </>
  );
  const view = render(assembly());
  const handles = (id: string) =>
    view.getByTestId(id).querySelectorAll('[aria-label="Drag block"]').length;
  try {
    expect(handles('first-editor')).toBe(2);
    expect(handles('second-editor')).toBe(2);
    act(() =>
      first.update.selection.set({
        anchor: { path: [1, 0, 0, 0, 0], offset: 0 },
        focus: { path: [1, 0, 1, 0, 0], offset: 1 },
      })
    );
    expect(
      first.plugin(BaseTablePlugin).read.selection()?.cellKeys
    ).toHaveLength(2);
    expect(handles('first-editor')).toBe(0);
    expect(handles('second-editor')).toBe(2);
    view.rerender(assembly(false));
    expect(handles('second-editor')).toBe(2);
    act(() =>
      first.update.selection.set({
        anchor: { path: [1, 0, 0, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0, 0, 0], offset: 0 },
      })
    );
    view.rerender(assembly());
    expect(handles('first-editor')).toBe(2);
    expect(handles('second-editor')).toBe(2);
  } finally {
    view.unmount();
  }
});
