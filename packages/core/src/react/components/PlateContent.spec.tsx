/// <reference types="@testing-library/jest-dom" />

import {
  ContentSlice,
  defineStateField,
  editorCommands,
  property,
  schema,
  target,
  valueCodecs,
} from '@platejs/plite';
import { useEditorViewState } from '@platejs/plite-react';
import { evaluateCommand } from '@platejs/plite/internal';
import { act, render, waitFor } from '@testing-library/react';
import React from 'react';

import { defineBasePlugin } from '../../lib';
import { createPlateEditor } from '../editor';
import { definePlatePlugin } from '../plugin';
import { useEditor } from '../stores';
import { Plate } from './Plate';
import { PlateContainer } from './PlateContainer';
import { PlateContent } from './PlateContent';

const value = [{ children: [{ text: 'one' }], type: 'paragraph' }] as const;

const VariantPlugin = defineBasePlugin('variant', {
  schema: {
    properties: {
      variant: schema.elementProperty(property.string(), {
        target: target.type('paragraph'),
      }),
    },
  },
});

const AtomicParserBPlugin = defineBasePlugin('atomicParserB', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: {
    as: 'u',
    abovePlite: ({ children }) => (
      <div data-testid="plite-renderer-b">{children}</div>
    ),
    beforeContainer: () => <span data-testid="container-renderer-b" />,
    beforeEditable: () => <span data-testid="renderer-b" />,
  },
}).extend(({ defineCodecs }) => ({
  codecs: defineCodecs({
    'application/x-plate-atomic-parser': {
      scope: 'document',
      decode: () =>
        ContentSlice.closed([
          {
            children: [{ atomicParserB: true, text: 'parsed-b' }],
            type: 'paragraph',
          },
        ]),
    },
  }),
}));

const ReadOnlyProbe = () => {
  const editor = useEditor();
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());

  return <span data-testid="read-only">{String(readOnly)}</span>;
};

const CommitFromLayoutEffect = ({ text }: { text?: string }) => {
  const editor = useEditor();

  React.useLayoutEffect(() => {
    if (!text) return;

    editor.update.text.insert(text, {
      at: { offset: 3, path: [0, 0] },
    });
  }, [editor, text]);

  return null;
};

describe('PlateContent', () => {
  it('keeps plain text DOM-synced when inactive Plate marks are installed', () => {
    const editor = createPlateEditor({
      plugins: [AtomicParserBPlugin],
      initialValue: value,
    });
    const { container } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    const textHost = container.querySelector('[data-plite-node="text"]');

    expect({
      reason: textHost?.getAttribute('data-plite-dom-sync-reason'),
      synced: textHost?.getAttribute('data-plite-dom-sync'),
    }).toEqual({ reason: null, synced: 'true' });
  });

  it('keeps internally compiled simple mark leaves DOM-synced', () => {
    const editor = createPlateEditor({
      plugins: [AtomicParserBPlugin],
      initialValue: [
        {
          children: [{ atomicParserB: true, text: 'one' }],
          type: 'paragraph',
        },
      ],
    });
    const { container } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );
    const textHost = container.querySelector('[data-plite-node="text"]');

    expect({
      reason: textHost?.getAttribute('data-plite-dom-sync-reason'),
      synced: textHost?.getAttribute('data-plite-dom-sync'),
    }).toEqual({ reason: null, synced: 'true' });
  });

  it('fails closed only where a custom Plate text component is active', () => {
    const CustomMarkPlugin = definePlatePlugin('customMark', {
      component: ({ children }) => <strong>{children}</strong>,
      render: { isDecoration: false },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const editor = createPlateEditor({
      plugins: [CustomMarkPlugin],
      initialValue: [
        {
          children: [{ customMark: true, text: 'active' }],
          type: 'paragraph',
        },
        { children: [{ text: 'inactive' }], type: 'paragraph' },
      ],
    });
    const { container } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );
    const textHosts = container.querySelectorAll('[data-plite-node="text"]');

    expect({
      reason: textHosts[0]?.getAttribute('data-plite-dom-sync-reason'),
      synced: textHosts[0]?.getAttribute('data-plite-dom-sync'),
    }).toEqual({ reason: 'custom-text', synced: null });
    expect({
      reason: textHosts[1]?.getAttribute('data-plite-dom-sync-reason'),
      synced: textHosts[1]?.getAttribute('data-plite-dom-sync'),
    }).toEqual({ reason: null, synced: 'true' });
  });

  it('fails closed where arbitrary text props are active', () => {
    const TextPropsPlugin = definePlatePlugin('textProps', {
      render: {
        isDecoration: false,
        textProps: { onBeforeInput: () => {} },
      },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const editor = createPlateEditor({
      plugins: [TextPropsPlugin],
      initialValue: [
        {
          children: [{ text: 'active', textProps: true }],
          type: 'paragraph',
        },
        { children: [{ text: 'inactive' }], type: 'paragraph' },
      ],
    });
    const { container } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );
    const textHosts = container.querySelectorAll('[data-plite-node="text"]');

    expect(textHosts[0]?.getAttribute('data-plite-dom-sync-reason')).toBe(
      'custom-text'
    );
    expect(textHosts[1]?.getAttribute('data-plite-dom-sync')).toBe('true');
  });

  it('fails closed for text-capable arbitrary injected props', () => {
    const InputInjectPlugin = definePlatePlugin('inputInject', {
      inject: {
        isLeaf: true,
        nodeProps: {
          transformProps: ({ props }) => ({
            ...props,
            onBeforeInput: () => {},
          }),
        },
      },
    });
    const editor = createPlateEditor({
      plugins: [InputInjectPlugin],
      initialValue: value,
    });
    const { container } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );
    const textHost = container.querySelector('[data-plite-node="text"]');

    expect(textHost?.getAttribute('data-plite-dom-sync-reason')).toBe(
      'custom-leaf'
    );
  });

  it('keeps ordinary Plate command middleware native-equivalent', () => {
    const editor = createPlateEditor({ initialValue: value });

    editor.update.selection.set({ path: [0, 0], offset: 3 });

    const evaluation = evaluateCommand(editor, editorCommands.insertText, {
      text: 'x',
    });

    expect(evaluation.materialHandlers).toEqual([]);
    expect(evaluation.nativeEquivalent).toBe(true);
  });

  it('owns default placeholder presentation above Plite structure', async () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const { container, rerender } = render(
      <Plate editor={editor}>
        <PlateContent placeholder="Type something" />
      </Plate>
    );

    await waitFor(() => {
      const placeholder = container.querySelector<HTMLElement>(
        '[data-plite-placeholder="true"]'
      );

      expect(placeholder?.style.opacity).toBe('0.333');
      expect(placeholder?.style.textDecoration).toBe('none');
    });

    rerender(
      <Plate editor={editor}>
        <PlateContent disableDefaultStyles placeholder="Type something" />
      </Plate>
    );

    await waitFor(() => {
      const placeholder = container.querySelector<HTMLElement>(
        '[data-plite-placeholder="true"]'
      );

      expect(placeholder?.style.opacity).toBe('');
      expect(placeholder?.style.textDecoration).toBe('');
    });
  });

  it('renders inside the Plate container without mutating editor runtime', () => {
    const editor = createPlateEditor({
      initialValue: value,
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
    expect(editor.api.dom.scroll()).toBe(getByTestId('plate-shell'));
    expect(Object.hasOwn(editor.runtime, 'uid')).toBe(false);
  });

  it('syncs readOnly and disabled into the Plite view state', async () => {
    const editor = createPlateEditor({
      initialValue: value,
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

  it('keeps node and text observers active for the Plate provider lifetime', async () => {
    const editor = createPlateEditor({
      plugins: [VariantPlugin],
      initialValue: value,
    });
    const onNodeChange = mock();
    const onTextChange = mock();

    render(
      <Plate
        editor={editor}
        onNodeChange={onNodeChange}
        onTextChange={onTextChange}
      >
        <span>provider only</span>
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

  it('publishes canonical commit, value, and selection contexts for the provider lifetime', async () => {
    const editor = createPlateEditor({
      initialValue: value,
    });
    const onCommit = mock();
    const onSelectionChange = mock();
    const onValueChange = mock();

    render(
      <Plate
        editor={editor}
        onCommit={onCommit}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
      >
        <span>provider only</span>
      </Plate>
    );

    onCommit.mockClear();
    onSelectionChange.mockClear();
    onValueChange.mockClear();

    act(() => {
      editor.update.text.insert('!', {
        at: { offset: 3, path: [0, 0] },
      });
    });

    const valueContext = onCommit.mock.calls.at(-1)?.[0];

    expect(valueContext).toEqual(
      expect.objectContaining({
        commit: expect.objectContaining({
          changed: expect.any(Object),
          changes: expect.any(Object),
        }),
        editor,
        snapshot: expect.objectContaining({
          children: [{ children: [{ text: 'one!' }], type: 'paragraph' }],
          selection: null,
        }),
      })
    );
    expect(onValueChange).toHaveBeenCalledWith({
      ...valueContext,
      value: editor.read.value(),
    });
    expect(onSelectionChange).not.toHaveBeenCalled();

    onCommit.mockClear();
    onSelectionChange.mockClear();
    onValueChange.mockClear();

    const selection = {
      kind: 'text' as const,
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    act(() => {
      editor.update.selection.set(selection);
    });

    const selectionContext = onCommit.mock.calls.at(-1)?.[0];

    expect(onSelectionChange).toHaveBeenCalledWith({
      ...selectionContext,
      selection,
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('publishes named roots and persisted metadata as one document value', () => {
    const revision = defineStateField({
      initial: 0,
      key: 'revision',
      persist: valueCodecs.number,
    });
    const localState = defineStateField({
      initial: 0,
      key: 'local-state',
    });
    const editor = createPlateEditor({
      plugins: [
        defineBasePlugin('figure', {
          schema: {
            element: {
              contentRoots: {
                caption: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
              blockContent: true,
              void: 'block',
            },
          },
        }),
        defineBasePlugin('documentState', {
          stateFields: [revision, localState],
        }),
      ],
      initialValue: {
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: {
          'caption:1': [
            { children: [{ text: 'First caption' }], type: 'paragraph' },
          ],
        },
      },
    });
    const onValueChange = mock();

    render(
      <Plate editor={editor} onValueChange={onValueChange}>
        <span>provider only</span>
      </Plate>
    );

    act(() => {
      editor.update((tx) => {
        tx.roots.replace('caption:1', [
          { children: [{ text: 'Updated caption' }], type: 'paragraph' },
        ]);
      });
    });

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: editor.read.value() })
    );
    expect(onValueChange.mock.calls.at(-1)?.[0].value.roots).toEqual({
      'caption:1': [
        { children: [{ text: 'Updated caption' }], type: 'paragraph' },
      ],
    });

    onValueChange.mockClear();
    act(() => {
      editor.update((tx) => {
        tx.setField(revision, 2);
      });
    });

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: editor.read.value() })
    );
    expect(onValueChange.mock.calls.at(-1)?.[0].value.meta).toEqual({
      revision: { value: 2, version: 1 },
    });

    onValueChange.mockClear();
    act(() => {
      editor.update((tx) => {
        tx.setField(localState, 1);
      });
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('publishes rerendered callbacks before child layout effects', () => {
    const editor = createPlateEditor({
      initialValue: value,
    });
    const initialOnCommit = mock();
    const latestOnCommit = mock();

    const Shell = ({
      onCommit,
      text,
    }: {
      onCommit: typeof initialOnCommit;
      text?: string;
    }) => (
      <Plate editor={editor} onCommit={onCommit}>
        <CommitFromLayoutEffect text={text} />
      </Plate>
    );

    const { rerender } = render(<Shell onCommit={initialOnCommit} />);

    initialOnCommit.mockClear();
    rerender(<Shell onCommit={latestOnCommit} text="!" />);

    expect(initialOnCommit).not.toHaveBeenCalled();
    expect(latestOnCommit).toHaveBeenCalledTimes(1);
  });

  it('focuses the editor end when autoFocusOnEditable flips readOnly off', async () => {
    const editor = createPlateEditor({
      initialValue: value,
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
      initialValue: value,
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
      initialValue: value,
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

  it('publishes the selected parser, codecs, and mounted renderers together', async () => {
    const editor = createPlateEditor({
      plugins: [AtomicParserBPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const { container, getByTestId, queryByTestId } = render(
      <Plate editor={editor}>
        <PlateContainer>
          <PlateContent />
        </PlateContainer>
      </Plate>
    );

    expect(queryByTestId('renderer-a')).not.toBeInTheDocument();
    expect(queryByTestId('container-renderer-a')).not.toBeInTheDocument();
    expect(queryByTestId('plite-renderer-a')).not.toBeInTheDocument();
    expect(getByTestId('renderer-b')).toBeInTheDocument();
    expect(getByTestId('container-renderer-b')).toBeInTheDocument();
    expect(getByTestId('plite-renderer-b')).toBeInTheDocument();

    let inserted = false;

    act(() => {
      inserted = editor.api.dom.clipboard.insertData({
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
        type: 'paragraph',
      },
    ]);
    await waitFor(() => {
      expect(container.querySelector('u')).toHaveTextContent('parsed-b');
    });
  });
});
