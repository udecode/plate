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
    properties: ['bold', 'code', 'highlight', 'italic'].map((key) =>
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

  it('clears a configured peer mark when enabling a mark', () => {
    const editor = createPlateEditor({
      plugins: [MarksPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update.marks.add('highlight', true);

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: 'highlight',
          nodeType: 'code',
          pressed: false,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onClick();

    const marks = editor.read.marks() as
      | { code?: boolean; highlight?: boolean }
      | undefined;

    expect(marks?.code).toBe(true);
    expect(marks?.highlight).toBeUndefined();
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
