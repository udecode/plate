import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseCodeDrawingPlugin } from '../BaseCodeDrawingPlugin';
import { insertCodeDrawing } from './insertCodeDrawing';

describe('insertCodeDrawing', () => {
  it('inserts the default code drawing node shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hi' }],
          type: 'p',
        },
      ],
    });

    editor.update.codeDrawing.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        data: {
          code: '',
          drawingMode: 'Both',
          drawingType: 'Mermaid',
        },
        type: NODES.codeDrawing,
      },
    ]);
  });

  it('merges custom data and respects the configured node type', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeDrawingPlugin.configure({
          type: 'custom-code-drawing',
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: 'p',
        },
      ],
    });

    editor.update((tx) => {
      insertCodeDrawing(tx, editor.getType(KEYS.codeDrawing), {
        data: {
          code: 'graph TD; A-->B',
          drawingType: 'Graphviz',
        },
      });
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'x' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        data: {
          code: 'graph TD; A-->B',
          drawingMode: 'Both',
          drawingType: 'Graphviz',
        },
        type: 'custom-code-drawing',
      },
    ]);
  });

  it('inserts after the current block without splitting its text', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'before' }],
          type: 'p',
        },
      ],
    });

    editor.update.codeDrawing.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'before' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: NODES.codeDrawing,
      },
    ]);
  });
});
