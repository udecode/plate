/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import type { Value } from '@platejs/plite';

import { act, render, waitFor } from '@testing-library/react';

import { createPlateEditor } from '../editor';
import { usePlateEditorReadOnly } from '../stores';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

const value: Value = [{ children: [{ text: 'one' }], type: 'p' }];

const ReadOnlyProbe = () => (
  <span data-testid="read-only">{String(usePlateEditorReadOnly())}</span>
);

describe('PlateContent', () => {
  it('syncs readOnly and disabled into the Plate store', async () => {
    const editor = createPlateEditor({ value });

    const Shell = ({
      disabled,
      readOnly,
    }: {
      disabled?: boolean;
      readOnly?: boolean;
    }) => (
      <Plate editor={editor}>
        <PlateContent disabled={disabled} readOnly={readOnly} />
        <ReadOnlyProbe />
      </Plate>
    );

    const { getByTestId, rerender } = render(<Shell readOnly={false} />);

    expect(editor.read.view.isReadOnly()).toBe(false);
    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('false');
    });

    rerender(<Shell disabled readOnly={false} />);

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
    });

    rerender(<Shell readOnly />);

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
    });
  });

  it('routes store node and text handlers through Plite change events', async () => {
    const editor = createPlateEditor({ value });
    const onNodeChange = mock();
    const onTextChange = mock();

    render(
      <Plate
        editor={editor}
        onNodeChange={onNodeChange}
        onTextChange={onTextChange}
      >
        <PlateContent />
      </Plate>
    );

    act(() => {
      editor.update.nodes.set({ variant: 'lead' } as any, { at: [0] });
      editor.update.text.insert('!', {
        at: { offset: 3, path: [0, 0] },
      });
    });

    await waitFor(() => {
      expect(onNodeChange).toHaveBeenCalledTimes(1);
      expect(onTextChange).toHaveBeenCalledTimes(1);
    });
  });

  it('focuses the editor end when autoFocusOnEditable flips readOnly off', async () => {
    const editor = createPlateEditor({ value });
    const focus = spyOn(HTMLElement.prototype, 'focus').mockImplementation(
      () => {}
    );

    const Shell = ({ readOnly }: { readOnly: boolean }) => (
      <Plate editor={editor}>
        <PlateContent autoFocusOnEditable readOnly={readOnly} />
      </Plate>
    );

    const { rerender } = render(<Shell readOnly />);

    expect(focus).not.toHaveBeenCalled();

    rerender(<Shell readOnly={false} />);

    await waitFor(() => {
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });

    focus.mockRestore();
  });

  it('mounts PlateContent under the public Plate store provider', async () => {
    const editor = createPlateEditor({
      id: 'runtime-plate',
      value,
    });

    const { getByTestId } = render(
      <Plate editor={editor} readOnly>
        <PlateContent data-testid="runtime-editable" />
        <ReadOnlyProbe />
      </Plate>
    );

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(
        document.querySelector('[data-plite-editor="true"]')
      ).toHaveAttribute('aria-readonly', 'true');
    });
  });

  it('routes public PlateContent through the v2 runtime editor branch', async () => {
    const editor = createPlateEditor({
      id: 'runtime-plate-content',
      value,
    });

    const { getByTestId } = render(
      <Plate editor={editor} readOnly>
        <PlateContent data-testid="runtime-editable" />
        <ReadOnlyProbe />
      </Plate>
    );

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(getByTestId('runtime-editable')).toHaveAttribute(
        'data-plite-editor',
        'true'
      );
      expect(getByTestId('runtime-editable')).toHaveAttribute(
        'aria-readonly',
        'true'
      );
      expect(typeof editor.api.react.refreshDecorations).toBe('function');
    });

    act(() => {
      editor.api.react.refreshDecorations();
    });
  });
});
