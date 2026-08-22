import {
  createPlateEditor,
  definePlatePlugin,
  Plate,
  PlateContent,
} from '@platejs/core/react';
import { property, type TextSelection } from '@platejs/plite';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { CursorOverlayPlugin } from './CursorOverlayPlugin';

const selection = {
  kind: 'text',
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 3, path: [0, 0] },
} satisfies TextSelection;

const nextSelection = {
  kind: 'text',
  anchor: { offset: 1, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
} satisfies TextSelection;

const nextSelectionRange = {
  kind: 'text',
  anchor: selection.anchor,
  focus: { offset: 4, path: [0, 0] },
} satisfies TextSelection;

const GeometryPlugin = definePlatePlugin('geometry', {
  schema: { mark: property.string() },
});

const NestedEditableProbePlugin = definePlatePlugin('nestedEditableProbe', {
  render: {
    belowNodes: () =>
      function NestedEditableProbe({ children }) {
        return (
          <div>
            <button
              aria-label="Nested control"
              contentEditable={false}
              data-testid="nested-control"
              type="button"
            />
            <div
              contentEditable
              data-testid="nested-editable"
              suppressContentEditableWarning
            >
              {children}
            </div>
          </div>
        );
      },
  },
});

const createCursorOverlayEditor = (withNestedEditable = false) =>
  createPlateEditor({
    plugins: [
      CursorOverlayPlugin,
      GeometryPlugin,
      ...(withNestedEditable ? [NestedEditableProbePlugin] : []),
    ],
    initialValue: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
  });

const waitForDeferredCursorRefresh = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const getCursorState = (editor: ReturnType<typeof createCursorOverlayEditor>) =>
  editor.plugin(CursorOverlayPlugin).store.get('cursors').selection;

const renderCursorOverlayEditor = (withNestedEditable = false) => {
  const editor = createCursorOverlayEditor(withNestedEditable);
  const result = render(
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
  const editable = result.container.querySelector<HTMLElement>(
    '[contenteditable="true"]'
  );

  if (!editable) throw new Error('Expected the editor editable.');

  return { ...result, editable, editor };
};

describe('CursorOverlayPlugin', () => {
  it('mounts without BlockSelectionPlugin', () => {
    const editor = createCursorOverlayEditor();

    expect(() =>
      render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      )
    ).not.toThrow();
  });

  it('refreshes the stored selection cursor after direct selection changes', async () => {
    const editor = createCursorOverlayEditor();

    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });

    editor.update.selection.set(nextSelection);
    await waitForDeferredCursorRefresh();

    expect(
      editor.plugin(CursorOverlayPlugin).store.get('cursors').selection
        ?.selection
    ).toEqual(nextSelection);
  });

  it('refreshes the stored selection cursor after partial selection updates', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });

    editor.update.selection.setRange({
      focus: { offset: 4, path: [0, 0] },
    });
    await waitForDeferredCursorRefresh();

    expect(
      editor.plugin(CursorOverlayPlugin).store.get('cursors').selection
        ?.selection
    ).toEqual(nextSelectionRange);
  });

  it('invalidates stored cursor geometry after document changes', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });
    const previousSelection = getCursorState(editor)?.selection;

    editor.plugin(GeometryPlugin).update.set('10px');
    await waitForDeferredCursorRefresh();

    expect(getCursorState(editor)?.selection).toEqual(selection);
    expect(getCursorState(editor)?.selection).not.toBe(previousSelection);
  });

  it('does not restore a deferred selection cursor after removal', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });
    editor.plugin(GeometryPlugin).update.set('10px');
    editor.plugin(CursorOverlayPlugin).api.removeCursor('selection');
    await waitForDeferredCursorRefresh();

    expect(getCursorState(editor)).toBeUndefined();
  });

  it('clears the stored selection before primary focus enters a nested editable', () => {
    const { editor, getByTestId } = renderCursorOverlayEditor(true);
    const nestedEditable = getByTestId('nested-editable');

    act(() => {
      editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
        selection,
      });
    });

    fireEvent.mouseDown(nestedEditable, { button: 0 });

    expect(getCursorState(editor)).toBeUndefined();
  });

  it('keeps the stored selection for controls and secondary presses', () => {
    const { editor, getByTestId } = renderCursorOverlayEditor(true);
    const control = getByTestId('nested-control');
    const nestedEditable = getByTestId('nested-editable');

    act(() => {
      editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
        selection,
      });
    });

    fireEvent.mouseDown(control, { button: 0 });
    expect(getCursorState(editor)).toBeDefined();

    fireEvent.mouseDown(nestedEditable, { button: 2 });
    expect(getCursorState(editor)).toBeDefined();
  });
});
