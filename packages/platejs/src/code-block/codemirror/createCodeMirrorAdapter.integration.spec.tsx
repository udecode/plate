import { EditorView } from '@codemirror/view';
import { act, render } from '@testing-library/react';
import React from 'react';

import { schema, TextApi } from '../../core';
import { EditorRoot } from '../../react/components/Plate';
import { EditorContent } from '../../react/components/PlateContent';
import { createEditor } from '../../react/editor';
import { CodeBlockPlugin } from '../../react/features/code-block';
import { definePlugin } from '../../react/plugin';
import { createCodeMirrorAdapter } from './createCodeMirrorAdapter';

const mountEditor = <E,>(editor: E) => {
  const rendered = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  const host = rendered.container.querySelector(
    '[data-code-block-codemirror]'
  )!;
  const view = EditorView.findFromDOM(host.firstElementChild as HTMLElement)!;

  return { rendered, view };
};

test('keeps a canonical listener mutation ahead of the local prediction', () => {
  let adapter!: ReturnType<typeof createCodeMirrorAdapter>;
  const CodeMirrorTestPlugin = definePlugin('codeMirrorListenerMutation', {
    component: ({ attributes, slots }) => (
      <div {...attributes}>
        {slots.externalText({ adapter, ariaLabel: 'Code', config: {} })}
      </div>
    ),
    schema: {
      element: { content: schema.content.text({ min: 1, max: 1 }) },
    },
  });
  const errors: unknown[] = [];
  const editor = createEditor({
    plugins: [CodeMirrorTestPlugin],
    initialValue: [
      { type: CodeMirrorTestPlugin.name, children: [{ text: 'a' }] },
    ],
    lifecycleErrorSink: (error) => errors.push(error),
  });
  let attempted = false;
  adapter = createCodeMirrorAdapter({
    extensions: EditorView.updateListener.of((update) => {
      if (!update.docChanged || attempted) return;
      attempted = true;
      editor.update.text.insert('R', { at: { path: [0, 0], offset: 0 } });
    }),
  });
  const { rendered, view } = mountEditor(editor);

  try {
    act(() =>
      view.dispatch({
        changes: { from: 1, insert: 'X' },
        userEvent: 'input.type',
      })
    );
    expect(editor.read.text.string([])).toBe('Ra');
    expect(view.state.doc.toString()).toBe('Ra');
    expect(errors).toEqual([
      expect.objectContaining({ phase: 'update', source: 'external-text' }),
    ]);
  } finally {
    rendered.unmount();
  }
});

test.each([
  [
    'leaves a non-empty code block in place',
    'code',
    [
      { type: 'paragraph', children: [{ text: 'above' }] },
      { type: 'codeBlock', children: [{ text: 'code' }] },
    ],
  ],
  [
    'turns an empty code block into a paragraph',
    '',
    [
      { type: 'paragraph', children: [{ text: 'above' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ],
  ],
])(
  'Backspace at the start of the code %s, as the code block delete rule does',
  (_, code, expected) => {
    const adapter = createCodeMirrorAdapter();
    const editor = createEditor({
      plugins: [
        CodeBlockPlugin.configure({
          component: ({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code', config: {} })}
            </div>
          ),
        }),
      ],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'above' }] },
        { type: 'codeBlock', children: [{ text: code }] },
      ],
    });
    const { rendered, view } = mountEditor(editor);

    try {
      act(() => {
        view.focus();
        view.dispatch({ selection: { anchor: 0 } });
        view.contentDOM.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Backspace',
          })
        );
      });
      expect(editor.read.children()).toEqual(expected);
    } finally {
      rendered.unmount();
    }
  }
);

test('recovers a canonical listener mutation during correction feedback', () => {
  let adapter!: ReturnType<typeof createCodeMirrorAdapter>;
  const CodeMirrorTestPlugin = definePlugin('codeMirrorCorrectionMutation', {
    component: ({ attributes, slots }) => (
      <div {...attributes}>
        {slots.externalText({ adapter, ariaLabel: 'Code', config: {} })}
      </div>
    ),
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
          if (!TextApi.isText(node) || !node.text.endsWith('bad')) return;
          tx.text.insert('good', {
            at: {
              anchor: { path, offset: node.text.length - 3 },
              focus: { path, offset: node.text.length },
            },
          });
        },
      },
    ],
    schema: {
      element: { content: schema.content.text({ min: 1, max: 1 }) },
    },
  });
  const errors: unknown[] = [];
  const editor = createEditor({
    plugins: [CodeMirrorTestPlugin],
    initialValue: [
      { type: CodeMirrorTestPlugin.name, children: [{ text: 'a' }] },
    ],
    lifecycleErrorSink: (error) => errors.push(error),
  });
  let attempted = false;
  adapter = createCodeMirrorAdapter({
    extensions: EditorView.updateListener.of((update) => {
      if (
        !update.docChanged ||
        attempted ||
        update.state.doc.toString() !== 'agood'
      ) {
        return;
      }
      attempted = true;
      editor.update.text.insert('R', { at: { path: [0, 0], offset: 0 } });
    }),
  });
  const { rendered, view } = mountEditor(editor);

  try {
    act(() =>
      view.dispatch({
        changes: { from: 1, insert: 'bad' },
        userEvent: 'input.type',
      })
    );
    expect(editor.read.text.string([])).toBe('Ragood');
    expect(view.state.doc.toString()).toBe('Ragood');
    expect(errors).toEqual([
      expect.objectContaining({ phase: 'update', source: 'external-text' }),
    ]);
  } finally {
    rendered.unmount();
  }
});
