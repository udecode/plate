import { createBaseEditor } from '@platejs/core';

import {
  BaseCodeDrawingPlugin,
  CODE_DRAWING_KEY,
} from '../BaseCodeDrawingPlugin';
import { insertCodeDrawing } from './insertCodeDrawing';

describe('insertCodeDrawing', () => {
  it('inserts the default code drawing node shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
      selection: {
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

    editor.update.code_drawing.insert();

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
        type: CODE_DRAWING_KEY,
      },
    ]);
  });

  it('merges custom data and respects the configured node type', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeDrawingPlugin.configure({
          node: { type: 'custom-code-drawing' },
        }),
      ],
      selection: {
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
      insertCodeDrawing(
        editor,
        tx,
        editor.getType(CODE_DRAWING_KEY),
        {
          data: {
            code: 'graph TD; A-->B',
            drawingType: 'Graphviz',
          },
        },
        { at: [1] }
      );
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

    editor.update.code_drawing.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'before' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: CODE_DRAWING_KEY,
      },
    ]);
  });
});
