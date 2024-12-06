import { createPlateEditor } from '@udecode/plate-core/react';
import { createRangeRef } from '@udecode/slate';

import {
  annotationToDecorations,
  annotationsToDecorations,
} from './annotationToDecorations';

describe('annotationToDecorations', () => {
  const editor = createPlateEditor();

  it('should create decoration for single leaf annotation', () => {
    editor.children = [
      {
        children: [{ text: 'hello world' }],
        type: 'p',
      },
    ];

    const annotation = {
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      }),
      text: 'hello',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
    ]);
  });

  it('should create decorations for annotation spanning multiple leaves', () => {
    editor.children = [
      {
        children: [{ text: 'he' }, { bold: true, text: 'll' }, { text: 'o' }],
        type: 'p',
      },
    ];

    const annotation = {
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 2] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 2] },
      }),
      text: 'hello',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      },
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 2, path: [0, 1] },
        },
      },
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [0, 2] },
          focus: { offset: 1, path: [0, 2] },
        },
      },
    ]);
  });

  it('should handle annotation at leaf boundaries', () => {
    editor.children = [
      {
        children: [
          { text: 'start ' },
          { bold: true, text: 'hello' },
          { text: ' end' },
        ],
        type: 'p',
      },
    ];

    const annotation = {
      range: {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 5, path: [0, 1] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 5, path: [0, 1] },
      }),
      text: 'hello',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 5, path: [0, 1] },
        },
      },
    ]);
  });

  it('should handle empty leaves', () => {
    editor.children = [
      {
        children: [{ text: '' }, { bold: true, text: 'hello' }, { text: '' }],
        type: 'p',
      },
    ];

    const annotation = {
      range: {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 5, path: [0, 1] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 5, path: [0, 1] },
      }),
      text: 'hello',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 5, path: [0, 1] },
        },
      },
    ]);
  });

  it('should handle non-existent node', () => {
    editor.children = [];

    const annotation = {
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      }),
      text: 'hello',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([]);
  });

  it('should create decorations for annotation spanning multiple blocks', () => {
    editor.children = [
      {
        children: [{ text: 'first' }],
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        type: 'p',
      },
    ];

    const annotation = {
      range: {
        anchor: { offset: 3, path: [0, 0] }, // 'st' from 'first'
        focus: { offset: 3, path: [1, 0] }, // 'ond' from 'second'
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      }),
      text: 'st second',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([
      {
        annotation,
        range: {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 3, path: [1, 0] },
        },
      },
    ]);
  });

  it('should handle annotations at block edges', () => {
    editor.children = [
      {
        children: [{ text: 'first' }],
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        type: 'p',
      },
    ];

    const annotation = {
      range: {
        anchor: { offset: 3, path: [0, 0] }, // "t" from first
        focus: { offset: 1, path: [1, 0] }, // "s" from second
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      }),
      text: 't s',
    };

    const decorations = annotationToDecorations(editor, { annotation });

    expect(decorations).toEqual([
      {
        annotation,
        range: {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      {
        annotation,
        range: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
      },
    ]);
  });
});

describe('annotationsToDecorations', () => {
  const editor = createPlateEditor();

  it('should handle multiple annotations with different ranges', () => {
    editor.children = [
      {
        children: [{ text: 'hello world' }],
        type: 'p',
      },
    ];

    const annotation1 = {
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] }, // "hello"
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      }),
      text: 'hello',
    };

    const annotation2 = {
      range: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] }, // "world"
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      }),
      text: 'world',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    expect(decorations).toEqual([
      {
        annotation: annotation1,
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      {
        annotation: annotation2,
        range: {
          anchor: { offset: 6, path: [0, 0] },
          focus: { offset: 11, path: [0, 0] },
        },
      },
    ]);
  });

  it('should handle overlapping annotations', () => {
    editor.children = [
      {
        children: [{ text: 'hello world' }],
        type: 'p',
      },
    ];

    const annotation1 = {
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] }, // "hello w"
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      }),
      text: 'hello w',
    };

    const annotation2 = {
      range: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] }, // "world"
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      }),
      text: 'world',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    // Should include both annotations for the overlapping region
    expect(decorations).toEqual([
      {
        annotation: annotation1,
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 7, path: [0, 0] },
        },
      },
      {
        annotation: annotation2,
        range: {
          anchor: { offset: 6, path: [0, 0] },
          focus: { offset: 11, path: [0, 0] },
        },
      },
    ]);
  });

  it('should handle multiple annotations with same range', () => {
    editor.children = [
      {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    ];

    const annotation1 = {
      data: { type: 'spelling' },
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      }),
      text: 'hello',
    };

    const annotation2 = {
      data: { type: 'grammar' },
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: createRangeRef(editor, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      }),
      text: 'hello',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    // Should include both annotations for the same range
    expect(decorations).toEqual([
      {
        annotation: annotation1,
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      {
        annotation: annotation2,
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
    ]);
  });
});
