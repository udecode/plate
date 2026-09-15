/// <reference types="@testing-library/jest-dom" />

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import {
  ContentSlice,
  defineEditorSchema,
  defineStateField,
  editorCommands,
  property,
  schema,
  setEditorReadOnly,
  target,
  TextApi,
  valueCodecs,
  evaluateCommand,
} from '../../core';
import { definePlugin as defineHeadlessPlugin } from '../../lib';
import { createEditor } from '../editor';
import { useEditorViewState, useStateFieldValue } from '../plite-react';
import {
  type ContainerSiblingProps,
  definePlugin,
  type EditableSiblingProps,
} from '../plugin';
import { ParagraphPlugin } from '../plugins/paragraph/ParagraphPlugin';
import { useEditor } from '../stores';
import { EditorRoot } from './Plate';
import { EditorContainer } from './PlateContainer';
import { EditorContent } from './PlateContent';

const value = [{ children: [{ text: 'one' }], type: 'paragraph' }] as const;

test('plugin content attributes compose on the exact Editable and preserve explicit props', () => {
  const First = definePlugin('firstContentPaint', {
    render: {
      contentAttributes: {
        className: 'first',
        style: { color: 'red', backgroundColor: 'white' },
        'data-feature': 'first',
        'data-editor-feature': 'allowed',
      },
    },
  });
  const Second = definePlugin('secondContentPaint', {
    render: {
      contentAttributes: {
        className: 'second',
        style: { color: 'green' },
        'data-feature': 'second',
        'aria-label': 'plugin label',
      },
    },
  });
  const Cleared = definePlugin('clearedContentPaint', {
    render: { contentAttributes: { className: 'cleared' } },
  }).configure({ render: { contentAttributes: null } });
  const editor = createEditor({
    plugins: [
      First,
      Second,
      Cleared,
      definePlugin('disabledContentPaint', {
        enabled: false,
        render: { contentAttributes: { className: 'disabled' } },
      }),
    ],
    initialValue: value,
  });
  const ref = React.createRef<HTMLDivElement>();
  const onKeyDown = mock(() => true);
  const { container } = render(
    <EditorRoot editor={editor}>
      <EditorContent
        ref={ref}
        className="consumer"
        style={{ color: 'blue' }}
        aria-label="consumer label"
        onKeyDown={onKeyDown}
      />
    </EditorRoot>
  );
  const editable = container.querySelector('[data-editor="true"]')!;

  expect(editable.parentElement).toBe(container);
  expect(ref.current).toBe(editable);
  expect(editable.className).toBe('editor-editor first second consumer');
  expect(editable).toHaveStyle({ color: 'blue', backgroundColor: 'white' });
  expect(editable).toHaveAttribute('data-feature', 'second');
  expect(editable).toHaveAttribute('data-editor-feature', 'allowed');
  expect(editable).toHaveAttribute('aria-label', 'consumer label');
  expect(editable).toHaveAttribute('contenteditable', 'true');
  fireEvent.keyDown(editable, { key: 'F8' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});

test('content attributes honor editOnly.render when a view becomes read-only', () => {
  const editor = createEditor({
    initialValue: value,
    plugins: [
      definePlugin('viewPaint', {
        render: { contentAttributes: { className: 'always' } },
      }),
      definePlugin('editingPaint', {
        editOnly: true,
        render: { contentAttributes: { className: 'editing' } },
      }),
      definePlugin('persistentPaint', {
        editOnly: { render: false },
        render: { contentAttributes: { className: 'persistent' } },
      }),
    ],
  });
  const { container, rerender } = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  expect(container.querySelector('[data-editor="true"]')).toHaveClass(
    'editing'
  );
  rerender(
    <EditorRoot editor={editor}>
      <EditorContent readOnly />
    </EditorRoot>
  );
  const editable = container.querySelector('[data-editor="true"]')!;
  expect(editable).toHaveClass('always', 'persistent');
  expect(editable).not.toHaveClass('editing');
  expect(editable).toHaveAttribute('data-readonly', 'true');
  expect(editable).toHaveAttribute('aria-readonly', 'true');
});

const VariantPlugin = defineHeadlessPlugin('variant', {
  schema: {
    properties: {
      variant: schema.elementProperty(property.string(), {
        target: target.type('paragraph'),
      }),
    },
  },
});

const AtomicParserBPlugin = defineHeadlessPlugin('atomicParserB', {
  component: 'u',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  slots: {
    wrapRoot: ({ children }) => (
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

let storeDecorationReadCount = 0;

const StoreDecorationPlugin = definePlugin('storeDecoration', {
  decorate: {
    observe: ({ refresh, store }) =>
      store.subscribe(() => refresh({ nodeKeys: 'all' })),
    read: ({ entry, store }) => {
      storeDecorationReadCount += 1;

      if (!store.get('active') || !TextApi.isText(entry[0])) return [];

      return [
        {
          attributes: { 'data-testid': 'store-decoration' },
          key: `store-decoration:${entry[1].join('.')}`,
          range: {
            anchor: { offset: 0, path: entry[1] },
            focus: { offset: entry[0].text.length, path: entry[1] },
          },
        },
      ];
    },
  },
  initialState: {
    active: false,
  },
});

let idleDecorationReadCount = 0;

const IdleDecorationPlugin = definePlugin('idleDecoration', {
  decorate: {
    read: () => {
      idleDecorationReadCount += 1;

      return [];
    },
  },
  initialState: {
    revision: 0,
  },
});

const EditableRefProbe = (props: EditableSiblingProps) => {
  const { editableRef } = props;
  const [isEditable, setIsEditable] = React.useState(false);

  React.useEffect(() => {
    setIsEditable(editableRef.current?.dataset.editor === 'true');
  }, [editableRef]);

  return (
    <>
      <span data-testid="editable-ref-probe">{String(isEditable)}</span>
      <span data-testid="editable-prop-keys">
        {Object.keys(props).join(',')}
      </span>
    </>
  );
};

const ContainerRefProbe = (props: ContainerSiblingProps) => {
  const { containerRef } = props;
  const [isContainer, setIsContainer] = React.useState(false);

  React.useEffect(() => {
    setIsContainer(containerRef.current?.dataset.testid === 'plate-container');
  }, [containerRef]);

  return (
    <>
      <span data-testid="container-ref-probe">{String(isContainer)}</span>
      <span data-testid="container-prop-keys">
        {Object.keys(props).join(',')}
      </span>
    </>
  );
};

const RefScopePlugin = definePlugin('refScope', {
  slots: {
    beforeContainer: ContainerRefProbe,
    beforeEditable: EditableRefProbe,
  },
});

test('wrapRoot receives the exact Editable of each independent view and releases it on detach', () => {
  const attached = new Set<HTMLDivElement>();
  const observed = new Set<React.RefObject<HTMLDivElement | null>>();
  const Integration = definePlugin('viewIntegration', {
    slots: {
      // oxlint-disable-next-line eslint/func-name-matching -- Hooks require a named React component in this slot.
      wrapRoot: function ViewIntegration({ children, editableRef }) {
        React.useLayoutEffect(() => {
          observed.add(editableRef);
          const element = editableRef.current;
          if (!element) throw new Error('Expected this view Editable');
          attached.add(element);
          return () => {
            attached.delete(element);
          };
        }, [editableRef]);
        return <section>{children}</section>;
      },
    },
  });
  const editor = createEditor({
    plugins: [ParagraphPlugin, Integration],
    initialValue: value,
  });
  const assembly = (first = true) => (
    <React.StrictMode>
      {first && (
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContent data-testid="first-view" />
        </EditorRoot>
      )}
      <EditorRoot editor={editor} suppressInstanceWarning readOnly>
        <EditorContent data-testid="second-view" />
      </EditorRoot>
    </React.StrictMode>
  );
  const view = render(assembly());
  expect(attached).toEqual(
    new Set([view.getByTestId('first-view'), view.getByTestId('second-view')])
  );
  view.rerender(assembly(false));
  expect(attached).toEqual(new Set([view.getByTestId('second-view')]));
  view.unmount();
  expect(attached.size).toBe(0);
  expect([...observed].every((ref) => ref.current === null)).toBe(true);
});

const ReadOnlyProbe = () => {
  const editor = useEditor();
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());

  return <span data-testid="read-only">{String(readOnly)}</span>;
};

const ReadOnlyToggle = () => {
  const editor = useEditor();
  return (
    <button
      data-testid="toggle-view"
      onClick={() => setEditorReadOnly(editor, !editor.read.view.isReadOnly())}
      type="button"
    >
      Toggle read-only
    </button>
  );
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
  it('paints configured decorations in a bare host and refreshes through the existing source', async () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [
        StoreDecorationPlugin.configure({
          decorate: {
            attributes: {
              className: 'feature-paint',
              style: { backgroundColor: 'yellow' },
            },
          },
        }),
      ],
    });
    const { getByTestId, queryByTestId } = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    expect(queryByTestId('store-decoration')).toBeNull();
    await act(async () => {
      editor.plugin(StoreDecorationPlugin).store.set({ active: true });
    });
    await waitFor(() =>
      expect(getByTestId('store-decoration')).toHaveClass('feature-paint')
    );
    expect(getByTestId('store-decoration').style.backgroundColor).toBe(
      'yellow'
    );
    expect(getByTestId('store-decoration').textContent).toBe('one');
    await act(async () => {
      editor.plugin(StoreDecorationPlugin).store.set({ active: false });
    });
    await waitFor(() => expect(queryByTestId('store-decoration')).toBeNull());
  });

  it('invalidates a plugin decoration when its own store changes', async () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [StoreDecorationPlugin],
    });
    const { queryByTestId } = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    expect(queryByTestId('store-decoration')).not.toBeInTheDocument();

    await act(async () => {
      editor.plugin(StoreDecorationPlugin).store.set({ active: true });
    });

    await waitFor(() => {
      expect(queryByTestId('store-decoration')).toBeInTheDocument();
    });
  });

  it('invalidates only the decoration source owned by the changed plugin', async () => {
    storeDecorationReadCount = 0;
    idleDecorationReadCount = 0;

    const editor = createEditor({
      initialValue: value,
      plugins: [StoreDecorationPlugin, IdleDecorationPlugin],
    });

    render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    const storeBaseline = storeDecorationReadCount;
    const idleBaseline = idleDecorationReadCount;

    await act(async () => {
      editor.plugin(StoreDecorationPlugin).store.set({ active: true });
    });

    await waitFor(() => {
      expect(storeDecorationReadCount).toBeGreaterThan(storeBaseline);
    });
    expect(idleDecorationReadCount).toBe(idleBaseline);
  });

  it('passes exact editable and container refs to their sibling slots', async () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [RefScopePlugin],
    });

    const view = render(
      <EditorRoot editor={editor}>
        <EditorContainer data-testid="plate-container">
          <EditorContent />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() => {
      expect(view.getByTestId('editable-ref-probe')).toHaveTextContent('true');
      expect(view.getByTestId('container-ref-probe')).toHaveTextContent('true');
    });
    expect(view.getByTestId('editable-prop-keys')).toHaveTextContent(
      'editableRef'
    );
    expect(view.getByTestId('container-prop-keys')).toHaveTextContent(
      'containerRef'
    );
  });

  it('provides the Plite runtime for state-field-only plugins', () => {
    const title = defineStateField({
      initial: 'Untitled',
      key: 'document.title',
      persist: valueCodecs.string,
    });
    const editor = createEditor({
      plugins: [
        definePlugin('documentStateRuntime', {
          stateFields: [title],
        }),
      ],
    });
    const StateProbe = () => (
      <span data-testid="document-title">{useStateFieldValue(title)}</span>
    );

    const { getByTestId } = render(
      <EditorRoot editor={editor}>
        <StateProbe />
      </EditorRoot>
    );

    expect(getByTestId('document-title')).toHaveTextContent('Untitled');
  });

  it('republishes element properties to configured node components', async () => {
    const CompleteSchema = defineEditorSchema('schema:plate-content-property', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const ParagraphComponent = ({ attributes, children, element }: any) => (
      <p {...attributes} style={{ textAlign: element.variant }}>
        {children}
      </p>
    );
    const editor = createEditor({
      plugins: [
        CompleteSchema,
        ParagraphPlugin.configure({ component: ParagraphComponent }),
      ],
      initialValue: value,
    });
    const { container } = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    expect(container.querySelector('p')).not.toHaveStyle({
      textAlign: 'center',
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.set({ variant: 'center' }, { at: [0] });
      });
    });

    expect(container.querySelector('p')).toHaveStyle({ textAlign: 'center' });
  });

  it('keeps plain text DOM-synced when inactive Plate marks are installed', () => {
    const editor = createEditor({
      plugins: [AtomicParserBPlugin],
      initialValue: value,
    });
    const { container } = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    const textHost = container.querySelector('[data-editor-node="text"]');

    expect({
      reason: textHost?.getAttribute('data-editor-dom-sync-reason'),
      synced: textHost?.getAttribute('data-editor-dom-sync'),
    }).toEqual({ reason: null, synced: 'true' });
  });

  it('keeps internally compiled simple mark leaves DOM-synced', () => {
    const editor = createEditor({
      plugins: [AtomicParserBPlugin],
      initialValue: [
        {
          children: [{ atomicParserB: true, text: 'one' }],
          type: 'paragraph',
        },
      ],
    });
    const { container } = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    const textHost = container.querySelector('[data-editor-node="text"]');

    expect({
      reason: textHost?.getAttribute('data-editor-dom-sync-reason'),
      synced: textHost?.getAttribute('data-editor-dom-sync'),
    }).toEqual({ reason: null, synced: 'true' });
  });

  it('fails closed only where a custom Plate text component is active', () => {
    const CustomMarkPlugin = definePlugin('customMark', {
      component: ({ children }) => <strong>{children}</strong>,
      render: { mark: { placement: 'text' } },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const editor = createEditor({
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
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    const textHosts = container.querySelectorAll('[data-editor-node="text"]');

    expect({
      reason: textHosts[0]?.getAttribute('data-editor-dom-sync-reason'),
      synced: textHosts[0]?.getAttribute('data-editor-dom-sync'),
    }).toEqual({ reason: 'custom-text', synced: null });
    expect({
      reason: textHosts[1]?.getAttribute('data-editor-dom-sync-reason'),
      synced: textHosts[1]?.getAttribute('data-editor-dom-sync'),
    }).toEqual({ reason: null, synced: 'true' });
  });

  it('fails closed where arbitrary text props are active', () => {
    const TextPropsPlugin = definePlugin('textProps', {
      render: {
        mark: {
          placement: 'text',
          textAttributes: { onBeforeInput: () => {} },
        },
      },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const editor = createEditor({
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
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    const textHosts = container.querySelectorAll('[data-editor-node="text"]');

    expect(textHosts[0]?.getAttribute('data-editor-dom-sync-reason')).toBe(
      'custom-text'
    );
    expect(textHosts[1]?.getAttribute('data-editor-dom-sync')).toBe('true');
  });

  it('fails closed for text-capable arbitrary injected props', () => {
    const InputInjectPlugin = definePlugin('inputInject', {
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
    const editor = createEditor({
      plugins: [InputInjectPlugin],
      initialValue: value,
    });
    const { container } = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    const textHost = container.querySelector('[data-editor-node="text"]');

    expect(textHost?.getAttribute('data-editor-dom-sync-reason')).toBe(
      'custom-leaf'
    );
  });

  it('keeps ordinary Plate command middleware native-equivalent', () => {
    const editor = createEditor({ initialValue: value });

    editor.update.selection.set({ path: [0, 0], offset: 3 });

    const evaluation = evaluateCommand(editor, editorCommands.insertText, {
      text: 'x',
    });

    expect(evaluation.materialHandlers).toEqual([]);
    expect(evaluation.nativeEquivalent).toBe(true);
  });

  it('preserves the native placeholder element', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const { container } = render(
      <EditorRoot editor={editor}>
        <EditorContent placeholder="Type something" />
      </EditorRoot>
    );
    await waitFor(() => {
      const placeholder = container.querySelector<HTMLElement>(
        '[data-editor-placeholder="true"]'
      );
      expect(placeholder?.textContent).toBe('Type something');
      expect(placeholder?.getAttribute('contenteditable')).toBe('false');
    });
  });

  it('renders inside the Plate container without mutating editor runtime', () => {
    const editor = createEditor({
      initialValue: value,
    });
    let commandEditor: ReturnType<typeof useEditor> | undefined;
    function CommandProbe() {
      commandEditor = useEditor();
      return null;
    }
    const rendered = render(
      <EditorRoot editor={editor}>
        <EditorContainer data-testid="plate-shell">
          <EditorContent data-testid="runtime-editable" />
          <CommandProbe />
        </EditorContainer>
      </EditorRoot>
    );
    const { getByTestId } = rendered;

    expect(getByTestId('plate-shell')).toContainElement(
      getByTestId('runtime-editable')
    );
    expect(commandEditor).not.toBe(editor);
    expect(commandEditor!.api.dom.scroll()).toBe(getByTestId('plate-shell'));
    expect(Object.hasOwn(editor.runtime, 'uid')).toBe(false);
    const staleInsert = commandEditor!.update.text.insert;

    rendered.unmount();
    expect(() => staleInsert('x')).toThrow(/read-only/);
  });

  it('syncs readOnly and disabled into the Plite view state', async () => {
    const editor = createEditor({
      initialValue: value,
    });

    const Shell = ({
      disabled,
      readOnly,
    }: {
      disabled?: boolean;
      readOnly?: boolean;
    }) => (
      <EditorRoot editor={editor}>
        <EditorContent disabled={disabled} readOnly={readOnly} />
        <ReadOnlyProbe />
      </EditorRoot>
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

  it('tracks imperative readOnly changes when Plate is uncontrolled', async () => {
    const editor = createEditor({
      initialValue: value,
    });
    const { getByTestId } = render(
      <EditorRoot editor={editor}>
        <EditorContent data-testid="runtime-editable" />
        <ReadOnlyProbe />
      </EditorRoot>
    );

    act(() => setEditorReadOnly(editor, true));

    await waitFor(() => {
      expect(
        getByTestId('runtime-editable').getAttribute('aria-readonly')
      ).toBe('true');
      expect(getByTestId('read-only')).toHaveTextContent('true');
    });

    act(() => setEditorReadOnly(editor, false));

    await waitFor(() => {
      expect(
        getByTestId('runtime-editable').getAttribute('aria-readonly')
      ).toBeNull();
      expect(getByTestId('read-only')).toHaveTextContent('false');
    });
  });

  it('applies mounted-view read-only changes without changing sibling views', async () => {
    const editor = createEditor({ initialValue: value });
    const { getByTestId } = render(
      <>
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContent data-testid="first-view" />
          <ReadOnlyToggle />
        </EditorRoot>
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContent data-testid="second-view" />
        </EditorRoot>
      </>
    );

    fireEvent.click(getByTestId('toggle-view'));
    await waitFor(() => {
      expect(getByTestId('first-view').getAttribute('aria-readonly')).toBe(
        'true'
      );
    });
    expect(getByTestId('second-view').getAttribute('aria-readonly')).toBeNull();
    expect(editor.read.view.isReadOnly()).toBe(false);

    fireEvent.click(getByTestId('toggle-view'));
    await waitFor(() => {
      expect(
        getByTestId('first-view').getAttribute('aria-readonly')
      ).toBeNull();
    });
    expect(editor.read.children()).toEqual(value);
  });

  it('keeps node and text observers active for the Plate provider lifetime', async () => {
    const editor = createEditor({
      plugins: [VariantPlugin],
      initialValue: value,
    });
    const onNodeChange = mock();
    const onTextChange = mock();

    render(
      <EditorRoot
        editor={editor}
        onNodeChange={onNodeChange}
        onTextChange={onTextChange}
      >
        <span>provider only</span>
      </EditorRoot>
    );

    act(() => {
      editor.update.nodes.set({ variant: 'lead' }, { at: [0] });
      editor.update.text.insert('!', {
        at: { offset: 3, path: [0, 0] },
      });
    });

    await waitFor(() => {
      expect(onNodeChange).toHaveBeenCalledTimes(1);
      expect(onTextChange).toHaveBeenCalledTimes(1);
    });
    expect(onNodeChange.mock.calls[0]![0].editor).toBe(editor);
    expect(onTextChange.mock.calls[0]![0].editor).toBe(editor);
  });

  it('publishes canonical commit, value, and selection contexts for the provider lifetime', async () => {
    const editor = createEditor({
      initialValue: value,
    });
    const onCommit = mock();
    const onSelectionChange = mock();
    const onValueChange = mock();

    render(
      <EditorRoot
        editor={editor}
        onCommit={onCommit}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
      >
        <span>provider only</span>
      </EditorRoot>
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
    const editor = createEditor({
      plugins: [
        definePlugin('figure', {
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
        definePlugin('documentState', {
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
      <EditorRoot editor={editor} onValueChange={onValueChange}>
        <span>provider only</span>
      </EditorRoot>
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
    const editor = createEditor({
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
      <EditorRoot editor={editor} onCommit={onCommit}>
        <CommitFromLayoutEffect text={text} />
      </EditorRoot>
    );

    const { rerender } = render(<Shell onCommit={initialOnCommit} />);

    initialOnCommit.mockClear();
    rerender(<Shell onCommit={latestOnCommit} text="!" />);

    expect(initialOnCommit).not.toHaveBeenCalled();
    expect(latestOnCommit).toHaveBeenCalledTimes(1);
  });

  it('focuses the editor end when autoFocusOnEditable flips readOnly off', async () => {
    const editor = createEditor({
      initialValue: value,
    });
    const focus = spyOn(HTMLElement.prototype, 'focus').mockImplementation(
      () => {}
    );

    const Shell = ({ readOnly }: { readOnly: boolean }) => (
      <EditorRoot editor={editor}>
        <EditorContent autoFocusOnEditable readOnly={readOnly} />
      </EditorRoot>
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
    const editor = createEditor({
      id: 'runtime-plate',
      initialValue: value,
    });

    const { getByTestId } = render(
      <EditorRoot editor={editor} readOnly>
        <EditorContent data-testid="runtime-editable" />
        <ReadOnlyProbe />
      </EditorRoot>
    );

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(document.querySelector('[data-editor="true"]')).toHaveAttribute(
        'aria-readonly',
        'true'
      );
    });
  });

  it('routes public PlateContent through the v2 runtime editor branch', async () => {
    const editor = createEditor({
      id: 'runtime-plate-content',
      initialValue: value,
    });

    const { getByTestId } = render(
      <EditorRoot editor={editor} readOnly>
        <EditorContent data-testid="runtime-editable" />
        <ReadOnlyProbe />
      </EditorRoot>
    );

    await waitFor(() => {
      expect(getByTestId('read-only')).toHaveTextContent('true');
      expect(getByTestId('runtime-editable')).toHaveAttribute(
        'data-editor',
        'true'
      );
      expect(getByTestId('runtime-editable')).toHaveAttribute(
        'aria-readonly',
        'true'
      );
    });
  });

  it('publishes the selected parser, codecs, and mounted renderers together', async () => {
    const editor = createEditor({
      plugins: [AtomicParserBPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const { container, getByTestId, queryByTestId } = render(
      <EditorRoot editor={editor}>
        <EditorContainer>
          <EditorContent />
        </EditorContainer>
      </EditorRoot>
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
