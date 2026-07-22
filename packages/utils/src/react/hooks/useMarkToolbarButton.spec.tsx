import React from 'react';

import { createBasePlugin } from '@platejs/core';
import {
  createPlateEditor,
  Plate,
  type PlateEditor,
} from '@platejs/core/react';
import { defineEditorExtension, property, schema } from '@platejs/plite';
import { renderHook } from '@testing-library/react';

import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from './useMarkToolbarButton';

const MarksPlugin = createBasePlugin({
  key: 'testMarks',
  schema: {
    properties: ['bold', 'italic', 'subscript', 'superscript'].map((key) =>
      schema.textProperty(key, property.boolean())
    ),
  },
});

const createWrapper = (editor: PlateEditor) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('useMarkToolbarButton', () => {
  it('derives pressed state from editor marks', () => {
    const editor = createPlateEditor({
      plugins: [MarksPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update.marks.add('bold', true);

    const { result } = renderHook(
      () => useMarkToolbarButtonState({ clear: 'italic', nodeType: 'bold' }),
      {
        wrapper: createWrapper(editor),
      }
    );

    expect(result.current).toEqual({
      clear: 'italic',
      nodeType: 'bold',
      pressed: true,
    });
  });

  it('toggles the mark and focuses the editor on click', () => {
    const editor = createPlateEditor({
      plugins: [MarksPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update.marks.add('italic', true);
    const focusSpy = mock(() => {});
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            focus: focusSpy,
          },
        },
        name: 'test:dom-focus',
      })
    );

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: ['italic'],
          nodeType: 'bold',
          pressed: true,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onClick();

    const marks = editor.read.marks() as
      | { bold?: boolean; italic?: boolean }
      | undefined;

    expect(marks?.bold).toBe(true);
    expect(marks?.italic).toBeUndefined();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('removes only the target mark when it is already active', () => {
    const editor = createPlateEditor({
      plugins: [MarksPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update.marks.add('bold', true);
    editor.update.marks.add('italic', true);

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: ['bold', 'italic'],
          nodeType: 'bold',
          pressed: true,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onClick();

    const marks = editor.read.marks() as
      | { bold?: boolean; italic?: boolean }
      | undefined;

    expect(marks?.bold).toBeUndefined();
    expect(marks?.italic).toBe(true);
  });

  it('replaces mutually exclusive marks when enabling a mark', () => {
    const editor = createPlateEditor({
      plugins: [MarksPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update.marks.add('superscript', true);

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: 'superscript',
          nodeType: 'subscript',
          pressed: false,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onClick();

    const marks = editor.read.marks() as
      | { subscript?: boolean; superscript?: boolean }
      | undefined;

    expect(marks?.subscript).toBe(true);
    expect(marks?.superscript).toBeUndefined();
  });

  it('prevents the default mouse down behavior', () => {
    const editor = createPlateEditor({
      plugins: [MarksPlugin],
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const preventDefault = mock();

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: undefined,
          nodeType: 'bold',
          pressed: false,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onMouseDown({
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalled();
  });
});
