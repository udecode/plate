import React from 'react';

import { createBasePlugin } from '@platejs/core';
import {
  createPlateEditor,
  Plate,
  type PlateEditor,
} from '@platejs/core/react';
import { property, schema } from '@platejs/plite';
import { renderHook } from '@testing-library/react';

import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from './useMarkToolbarButton';

const Emphasis = schema.property.exclusive('test:emphasis');
const Literal = schema.property.exclusive('test:literal');
const MarksPlugin = createBasePlugin({
  name: 'testMarks',
  schema: {
    properties: [
      schema.textProperty('bold', property.boolean(), {
        exclusive: [Emphasis],
      }),
      schema.textProperty('italic', property.boolean(), {
        exclusive: [Emphasis],
      }),
      schema.textProperty('code', property.boolean(), {
        exclusive: [Literal],
      }),
      schema.textProperty('highlight', property.boolean(), {
        exclusive: [Literal],
      }),
    ],
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
      () => useMarkToolbarButtonState({ nodeType: 'bold' }),
      {
        wrapper: createWrapper(editor),
      }
    );

    expect(result.current).toEqual({
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
    const focusSpy = spyOn(editor.api.dom, 'focus').mockImplementation(
      () => {}
    );

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
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
    editor.update.marks.add('code', true);

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          nodeType: 'bold',
          pressed: true,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onClick();

    const marks = editor.read.marks() as
      | { bold?: boolean; code?: boolean }
      | undefined;

    expect(marks?.bold).toBeUndefined();
    expect(marks?.code).toBe(true);
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
