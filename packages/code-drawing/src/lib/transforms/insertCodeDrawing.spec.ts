import { createSlateEditor } from 'platejs';

import {
  BaseCodeDrawingPlugin,
  CODE_DRAWING_KEY,
} from '../BaseCodeDrawingPlugin';
import { insertCodeDrawing } from './insertCodeDrawing';

describe('insertCodeDrawing', () => {
  it('inserts the default code drawing node shape', () => {
    const editor = createSlateEditor({
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

    insertCodeDrawing(editor);

    expect(editor.children).toMatchObject([
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
    const editor = createSlateEditor({
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

    insertCodeDrawing(editor, {
      data: {
        code: 'graph TD; A-->B',
        drawingType: 'Graphviz',
      },
    });

    expect(editor.children).toMatchObject([
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
});
