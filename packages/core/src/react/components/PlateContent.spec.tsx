/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { property, schema, target, type Value } from '@platejs/plite';
import { useEditorViewState } from '@platejs/plite-react';

import { act, render, waitFor } from '@testing-library/react';

import { createBasePlugin } from '../../lib';
import { createPlateEditor } from '../editor';
import { useEditorRef } from '../stores';
import { Plate } from './Plate';
import { PlateContainer } from './PlateContainer';
import { PlateContent } from './PlateContent';

const value: Value = [{ children: [{ text: 'one' }], type: 'p' }];

const VariantPlugin = createBasePlugin({
  key: 'variant',
  schema: {
    properties: [
      schema.elementProperty('variant', property.string(), {
        target: target.type('p'),
      }),
    ],
  },
});

const AtomicParserAPlugin = createBasePlugin({
  key: 'atomicParserA',
  parser: {
    deserialize: () => [
      {
        children: [{ atomicParserA: true, text: 'parsed-a' }],
        type: 'p',
      },
    ],
    format: 'application/x-plate-atomic-parser',
  },
  render: {
    as: 'mark',
    abovePlite: ({ children }) => (
      <div data-testid="plite-renderer-a">{children}</div>
    ),
    beforeContainer: () => <span data-testid="container-renderer-a" />,
    beforeEditable: () => <span data-testid="renderer-a" />,
  },
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

const AtomicParserBPlugin = createBasePlugin({
  key: 'atomicParserB',
  parser: {
    deserialize: () => [
      {
        children: [{ atomicParserB: true, text: 'parsed-b' }],
        type: 'p',
      },
    ],
    format: 'application/x-plate-atomic-parser',
  },
  render: {
    as: 'u',
    abovePlite: ({ children }) => (
      <div data-testid="plite-renderer-b">{children}</div>
    ),
    beforeContainer: () => <span data-testid="container-renderer-b" />,
    beforeEditable: () => <span data-testid="renderer-b" />,
  },
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

const AtomicConfigurationPlugin = createBasePlugin({
  config: { variant: 'a' as 'a' | 'b' },
  key: 'atomicConfiguration',
}).extend(({ plugin }) => ({
  plugins: [
    plugin.config.variant === 'a' ? AtomicParserAPlugin : AtomicParserBPlugin,
  ],
}));

const ReadOnlyProbe = () => {
  const editor = useEditorRef();
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());

  return <span data-testid="read-only">{String(readOnly)}</span>;
};

describe('PlateContent', () => {
  it('renders inside the Plate container without mutating editor runtime', () => {
    const editor = createPlateEditor({
      value,
    });
    const { getByTestId } = render(
      <Plate editor={editor}>
        <PlateContainer data-testid="plate-shell">
          <PlateContent data-testid="runtime-editable" />
        </PlateContainer>
      </Plate>
    );

    expect(getByTestId('plate-shell')).toContainElement(
      getByTestId('runtime-editable')
    );
    expect(Object.hasOwn(editor.runtime, 'uid')).toBe(false);
  });

  it('syncs readOnly and disabled into the Plite view state', async () => {
    const editor = createPlateEditor({
      value,
    });

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
    const editor = createPlateEditor({
      plugins: [VariantPlugin],
      value,
    });
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
    const editor = createPlateEditor({
      value,
    });
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
      kind: 'text',
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

  it('publishes configured schema, codecs, and mounted renderers together', async () => {
    const editor = createPlateEditor({
      plugins: [AtomicConfigurationPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const beforeFingerprint = editor.read.schema.identity()?.fingerprint;
    const { container, getByTestId, queryByTestId } = render(
      <Plate editor={editor}>
        <PlateContainer>
          <PlateContent />
        </PlateContainer>
      </Plate>
    );

    expect(getByTestId('renderer-a')).toBeInTheDocument();
    expect(getByTestId('container-renderer-a')).toBeInTheDocument();
    expect(getByTestId('plite-renderer-a')).toBeInTheDocument();
    expect(queryByTestId('renderer-b')).not.toBeInTheDocument();
    expect(queryByTestId('container-renderer-b')).not.toBeInTheDocument();
    expect(queryByTestId('plite-renderer-b')).not.toBeInTheDocument();

    act(() => {
      editor.configure(AtomicConfigurationPlugin, { variant: 'b' });
    });

    await waitFor(() => {
      expect(queryByTestId('renderer-a')).not.toBeInTheDocument();
      expect(queryByTestId('container-renderer-a')).not.toBeInTheDocument();
      expect(queryByTestId('plite-renderer-a')).not.toBeInTheDocument();
      expect(getByTestId('renderer-b')).toBeInTheDocument();
      expect(getByTestId('container-renderer-b')).toBeInTheDocument();
      expect(getByTestId('plite-renderer-b')).toBeInTheDocument();
    });
    expect(editor.read.schema.identity()?.fingerprint).not.toBe(
      beforeFingerprint
    );

    let inserted = false;

    act(() => {
      inserted = editor.api.clipboard.insertData({
        files: [],
        getData: (format: string) =>
          format === 'application/x-plate-atomic-parser' ? 'payload' : '',
        types: ['application/x-plate-atomic-parser'],
      } as any);
    });

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ atomicParserB: true, text: 'parsed-b' }],
        type: 'p',
      },
    ]);
    await waitFor(() => {
      expect(container.querySelector('u')).toHaveTextContent('parsed-b');
    });
  });
});
