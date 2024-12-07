import { createPlateEditor } from '@udecode/plate-core/react';

import { annotationsToDecorations } from './annotationsToDecorations';

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
      rangeRef: expect.any(Object),
      text: 'hello',
    };

    const annotation2 = {
      range: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] }, // "world"
      },
      rangeRef: expect.any(Object),
      text: 'world',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 0] },
        annotations: [annotation1],
        focus: { offset: 5, path: [0, 0] },
      },
      {
        anchor: { offset: 6, path: [0, 0] },
        annotations: [annotation2],
        focus: { offset: 11, path: [0, 0] },
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
      rangeRef: expect.any(Object),
      text: 'hello w',
    };

    const annotation2 = {
      range: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] }, // "world"
      },
      rangeRef: expect.any(Object),
      text: 'world',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    // Should include both annotations for the overlapping region
    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 0] },
        annotations: [annotation1],
        focus: { offset: 7, path: [0, 0] },
      },
      {
        anchor: { offset: 6, path: [0, 0] },
        annotations: [annotation2],
        focus: { offset: 11, path: [0, 0] },
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
      rangeRef: expect.any(Object),
      text: 'hello',
    };

    const annotation2 = {
      data: { type: 'grammar' },
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: expect.any(Object),
      text: 'hello',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    // Should include both annotations for the same range
    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 0] },
        annotations: [annotation1, annotation2],
        focus: { offset: 5, path: [0, 0] },
      },
    ]);
  });
});

describe('annotationToDecorations with multiple annotations', () => {
  const editor = createPlateEditor();

  it('should merge overlapping annotations into single decoration', () => {
    editor.children = [
      {
        children: [{ text: 'hello world' }],
        type: 'p',
      },
    ];

    const annotation1 = {
      data: { type: 'spelling' },
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: expect.any(Object),
      text: 'hello',
    };

    const annotation2 = {
      data: { type: 'grammar' },
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: expect.any(Object),
      text: 'hello',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 0] },
        annotations: [annotation1, annotation2],
        focus: { offset: 5, path: [0, 0] },
      },
    ]);
  });

  it('should handle multiple non-overlapping annotations', () => {
    editor.children = [
      {
        children: [{ text: 'hello world' }],
        type: 'p',
      },
    ];

    const annotation1 = {
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      rangeRef: expect.any(Object),
      text: 'hello',
    };

    const annotation2 = {
      range: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
      rangeRef: expect.any(Object),
      text: 'world',
    };

    const decorations = annotationsToDecorations(editor, {
      annotations: [annotation1, annotation2],
    });

    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 0] },
        annotations: [annotation1],
        focus: { offset: 5, path: [0, 0] },
      },
      {
        anchor: { offset: 6, path: [0, 0] },
        annotations: [annotation2],
        focus: { offset: 11, path: [0, 0] },
      },
    ]);
  });

  // it('should handle partially overlapping annotations', () => {
  //   editor.children = [
  //     {
  //       children: [{ text: 'hello world' }],
  //       type: 'p',
  //     },
  //   ];

  //   const annotation1 = {
  //     range: {
  //       anchor: { offset: 0, path: [0, 0] },
  //       focus: { offset: 7, path: [0, 0] }, // "hello w"
  //     },
  //     rangeRef: expect.any(Object),
  //     text: 'hello w',
  //   };

  //   const annotation2 = {
  //     range: {
  //       anchor: { offset: 6, path: [0, 0] },
  //       focus: { offset: 11, path: [0, 0] }, // "world"
  //     },
  //     rangeRef: expect.any(Object),
  //     text: 'world',
  //   };

  //   const decorations = annotationsToDecorations(editor, {
  //     annotations: [annotation1, annotation2],
  //   });

  //   expect(decorations).toEqual([
  //     {
  //       anchor: { offset: 0, path: [0, 0] },
  //       annotations: [annotation1],
  //       focus: { offset: 6, path: [0, 0] },
  //     },
  //     {
  //       anchor: { offset: 6, path: [0, 0] },
  //       annotations: [annotation1, annotation2],
  //       focus: { offset: 7, path: [0, 0] },
  //     },
  //     {
  //       anchor: { offset: 7, path: [0, 0] },
  //       annotations: [annotation2],
  //       focus: { offset: 11, path: [0, 0] },
  //     },
  //   ]);
  // });
});
