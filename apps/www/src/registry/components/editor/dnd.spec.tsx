import { expect, test } from 'bun:test';

import { act, render } from '@testing-library/react';
import { createEditor, ParagraphPlugin, EditorRoot } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import React from 'react';

import { Editor } from '@/registry/components/editor/editor';

import { DndKit } from './dnd';

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
          <EditorRoot editor={first}>
            <Editor />
          </EditorRoot>
        </section>
      )}
      <section data-testid="second-editor">
        <EditorRoot editor={second}>
          <Editor />
        </EditorRoot>
      </section>
    </>
  );
  const view = render(assembly());
  const handles = (id: string) =>
    view.getByTestId(id).querySelectorAll('[aria-label="Drag block"]').length;
  try {
    expect(handles('first-editor')).toBe(4);
    expect(handles('second-editor')).toBe(4);
    act(() =>
      first.update.selection.set({
        anchor: { path: [1, 0, 0, 0, 0], offset: 0 },
        focus: { path: [1, 0, 1, 0, 0], offset: 1 },
      })
    );
    expect(first.plugin(BaseTablePlugin).read.selection()?.cells).toHaveLength(
      2
    );
    expect(handles('first-editor')).toBe(0);
    expect(handles('second-editor')).toBe(4);
    view.rerender(assembly(false));
    expect(handles('second-editor')).toBe(4);
    act(() =>
      first.update.selection.set({
        anchor: { path: [1, 0, 0, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0, 0, 0], offset: 0 },
      })
    );
    view.rerender(assembly());
    expect(handles('first-editor')).toBe(4);
    expect(handles('second-editor')).toBe(4);
  } finally {
    view.unmount();
  }
});

test('a selected table keeps the editor handles', () => {
  const editor = createEditor({
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
  const view = render(
    <EditorRoot editor={editor}>
      <Editor />
    </EditorRoot>
  );

  try {
    act(() => editor.update.selection.setNodes([editor.key([1])!]));
    expect(editor.plugin(BaseTablePlugin).read.selection()?.cells).toHaveLength(
      2
    );
    expect(
      view.container.querySelectorAll('[aria-label="Drag block"]')
    ).toHaveLength(4);
  } finally {
    view.unmount();
  }
});
