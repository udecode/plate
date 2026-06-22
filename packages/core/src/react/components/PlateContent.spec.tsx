/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import type { Value } from '@platejs/slate';

import { act, render, waitFor } from '@testing-library/react';

import { SlateExtensionPlugin } from '../../lib';
import { createSlatePlugin } from '../../lib/plugin/createSlatePlugin';
import { createPlateEditor } from '../editor';
import {
  createPlateRuntimeEditor,
  PlateRuntimeContent,
} from '../editor/createPlateRuntimeEditor';
import {
  PlateStoreProvider,
  useEditorReadOnly,
  usePlateValue,
} from '../stores';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';
import { PlateContentStateEffect } from './PlateContentEffects';

const value: Value = [{ children: [{ text: 'one' }], type: 'p' }];

type RedecorateApi = {
  redecorate: () => void;
};

const ReadOnlyProbe = () => (
  <span data-testid="read-only">{String(useEditorReadOnly())}</span>
);

const DecorateVersionProbe = () => (
  <span data-testid="decorate-version">
    {String(usePlateValue('versionDecorate'))}
  </span>
);

describe('PlateContent', () => {
  it('syncs readOnly and disabled into the editor DOM state and Plate store', async () => {
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

    expect(editor.dom.readOnly).toBe(false);
    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('false');
    });

    rerender(<Shell disabled readOnly={false} />);

    expect(editor.dom.readOnly).toBe(true);
    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
    });

    rerender(<Shell readOnly />);

    expect(editor.dom.readOnly).toBe(true);
    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
    });
  });

  it('syncs store node and text handlers into SlateExtensionPlugin options', async () => {
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

    await waitFor(() => {
      expect(editor.getOption(SlateExtensionPlugin, 'onNodeChange')).toBe(
        onNodeChange
      );
      expect(editor.getOption(SlateExtensionPlugin, 'onTextChange')).toBe(
        onTextChange
      );
    });
  });

  it('focuses the editor end when autoFocusOnEditable flips readOnly off', async () => {
    const editor = createPlateEditor({ value });
    const focus = mock();

    editor.tf.focus = focus as typeof editor.tf.focus;

    const Shell = ({ readOnly }: { readOnly: boolean }) => (
      <Plate editor={editor}>
        <PlateContent autoFocusOnEditable readOnly={readOnly} />
      </Plate>
    );

    const { rerender } = render(<Shell readOnly />);

    expect(focus).not.toHaveBeenCalled();

    rerender(<Shell readOnly={false} />);

    await waitFor(() => {
      expect(focus).toHaveBeenCalledWith({ edge: 'endEditor' });
    });
  });

  it('mounts state effects with the v2 Plate runtime content adapter', async () => {
    const onNodeChange = mock();
    const onTextChange = mock();
    const RuntimeSlateExtensionPlugin = createSlatePlugin({
      key: SlateExtensionPlugin.key,
      options: {},
    });
    const editor = createPlateRuntimeEditor({
      id: 'runtime-content-state',
      initialValue: value,
      plugins: [RuntimeSlateExtensionPlugin],
      readOnly: true,
    });
    const originalFocus = editor.tf.focus;
    const focus = mock((options?: Parameters<typeof originalFocus>[0]) => {
      originalFocus(options);
    });

    editor.tf.focus = focus;

    const Shell = ({ readOnly }: { readOnly: boolean }) => (
      <PlateStoreProvider
        editor={editor}
        onNodeChange={onNodeChange}
        onTextChange={onTextChange}
        readOnly={readOnly}
        scope={editor.id}
      >
        <PlateRuntimeContent editor={editor} readOnly={readOnly} />
        <PlateContentStateEffect
          id={editor.id}
          editor={editor}
          readOnly={readOnly}
          autoFocusOnEditable
        />
        <ReadOnlyProbe />
      </PlateStoreProvider>
    );

    const { getByTestId, rerender } = render(<Shell readOnly />);

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(editor.getOption(SlateExtensionPlugin, 'onNodeChange')).toBe(
        onNodeChange
      );
      expect(editor.getOption(SlateExtensionPlugin, 'onTextChange')).toBe(
        onTextChange
      );
    });
    expect(focus).not.toHaveBeenCalled();

    rerender(<Shell readOnly={false} />);

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('false');
      expect(focus).toHaveBeenCalledWith({ edge: 'endEditor' });
    });
  });

  it('mounts the v2 Plate runtime editor under the public Plate store provider', async () => {
    const editor = createPlateRuntimeEditor({
      id: 'runtime-plate',
      initialValue: value,
    });

    const { getByTestId } = render(
      <Plate editor={editor} readOnly>
        <PlateRuntimeContent editor={editor} readOnly />
        <ReadOnlyProbe />
      </Plate>
    );

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(
        document.querySelector('[data-slate-editor="true"]')
      ).toHaveAttribute('aria-readonly', 'true');
    });
  });

  it('routes public PlateContent through the v2 runtime editor branch', async () => {
    const editor = createPlateRuntimeEditor({
      id: 'runtime-plate-content',
      initialValue: value,
    });

    const { getByTestId } = render(
      <Plate editor={editor} readOnly>
        <PlateContent data-testid="runtime-editable" />
        <ReadOnlyProbe />
        <DecorateVersionProbe />
      </Plate>
    );

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(getByTestId('runtime-editable')).toHaveAttribute(
        'data-slate-editor',
        'true'
      );
      expect(getByTestId('runtime-editable')).toHaveAttribute(
        'aria-readonly',
        'true'
      );
      expect(typeof (editor.api as RedecorateApi).redecorate).toBe('function');
      expect(getByTestId('decorate-version')).toHaveTextContent('1');
    });

    act(() => {
      (editor.api as RedecorateApi).redecorate();
    });

    await waitFor(() => {
      expect(getByTestId('decorate-version')).toHaveTextContent('2');
    });
  });
});
