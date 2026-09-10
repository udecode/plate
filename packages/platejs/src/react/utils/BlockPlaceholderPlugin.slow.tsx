/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  type BasePluginInput,
  defineBasePlugin,
  ElementIdPlugin,
} from 'platejs';
import { ParagraphPlugin, useEditor } from 'platejs/react';
import React from 'react';

import type { EditorDocumentValue, TextSelection } from '../../core';
import {
  createEditor as createPliteEditor,
  property,
  schema,
  target,
  type Value,
} from '../../facade';
import { Plate } from '../components/Plate';
import { PlateContent } from '../components/PlateContent';
import type { InternalPlateEditorWithInstalledPlugins } from '../editor/Editor';
import { createEditorWithEditor } from '../editor/withPlate';
import { useEditorContext } from '../internal/plite-components';
import { definePlatePlugin } from '../plugin/definePlatePlugin';
import {
  BlockPlaceholderPlugin,
  type BlockPlaceholderDefinition,
} from './BlockPlaceholderPlugin';

const BlockPlaceholderFixtureSchemaPlugin = defineBasePlugin(
  'blockPlaceholderFixtureSchema',
  {
    schema: {
      properties: {
        indent: schema.elementProperty(property.number(), {
          target: target.element(ParagraphPlugin),
        }),
        listType: schema.elementProperty(property.string(), {
          target: target.element(ParagraphPlugin),
        }),
      },
    },
  }
);
const ParagraphWithComponentPlugin = ParagraphPlugin.configure({
  component: ({ attributes, children }) => (
    <div {...attributes}>{children}</div>
  ),
});
const RootOwnerPlugin = defineBasePlugin('blockPlaceholderRootOwner', {
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        content: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

const renderPlaceholderEditor = <V extends Value, D>(
  editor: InternalPlateEditorWithInstalledPlugins<V, D>,
  options?: { autoFocus?: boolean; readOnly?: boolean }
) => {
  let mountedEditor: ReturnType<typeof useEditor> | undefined;
  function Content() {
    const view = useEditor();
    React.useLayoutEffect(() => {
      mountedEditor = view;
    }, [view]);
    return (
      <PlateContent
        autoFocus={options?.autoFocus ?? false}
        data-testid="plite-content-editable"
        data-variant="wordProcessor"
      />
    );
  }
  const rendered = render(
    <Plate editor={editor} readOnly={options?.readOnly} suppressInstanceWarning>
      <Content />
    </Plate>
  );
  return {
    ...rendered,
    get mountedEditor() {
      if (!mountedEditor) {
        throw new Error('Expected a mounted placeholder view.');
      }
      return mountedEditor;
    },
  };
};

const createEditor = (options?: {
  className?: string;
  elementIds?: boolean;
  placeholders?: Record<string, string>;
  plugins?: readonly BasePluginInput[];
  query?: BlockPlaceholderDefinition['initialState']['query'];
  readOnly?: boolean;
  selection?: TextSelection;
  value?: EditorDocumentValue<Value> | Value;
}) =>
  createEditorWithEditor(createPliteEditor<Value>(), {
    plugins: [
      ...(options?.elementIds ? [ElementIdPlugin] : []),
      BlockPlaceholderFixtureSchemaPlugin,
      RootOwnerPlugin,
      ParagraphWithComponentPlugin,
      ...(options?.plugins ?? []),
      BlockPlaceholderPlugin.configure({
        initialState: {
          ...(options?.className !== undefined
            ? { className: options.className }
            : {}),
          placeholders: options?.placeholders ?? {
            paragraph: 'Type something...',
          },
          ...(options?.query !== undefined ? { query: options.query } : {}),
        },
      }),
    ],
    selection: options?.selection ?? {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: options?.value ?? [
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'filled' }], type: 'paragraph' },
    ],
  });

const focusEditor = async (editor: ReturnType<typeof useEditor>) => {
  await React.act(async () => {
    editor.api.dom.focus();
  });
};

describe('block placeholder behavior', () => {
  it('sets the target for an active empty block and injects placeholder props', async () => {
    const editor = createEditor({ className: 'placeholder-class' });
    const { container, mountedEditor } = renderPlaceholderEditor(editor);

    await focusEditor(mountedEditor);

    await waitFor(() => {
      expect(
        container.querySelector('[placeholder="Type something..."]')
      ).toHaveClass('placeholder-class');
      expect(container.querySelectorAll('[placeholder]')).toHaveLength(1);
    });
  });

  it('clears the target when the editor is globally empty', async () => {
    const editor = createEditor({
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the only empty block has id metadata', async () => {
    const editor = createEditor({
      elementIds: true,
      value: [{ children: [{ text: '' }], id: 'block-1', type: 'paragraph' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('keeps the target on a single empty list item', async () => {
    const editor = createEditor({
      value: [
        {
          children: [{ text: '' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });
    const { container, mountedEditor } = renderPlaceholderEditor(editor);

    await focusEditor(mountedEditor);

    await waitFor(() => {
      expect(
        container.querySelector('[placeholder="Type something..."]')
      ).toBeInTheDocument();
    });
  });

  it('honors custom node metadata rules for pristine empty blocks', async () => {
    const CustomMetadataPlugin = defineBasePlugin('customMetadata', {
      schema: {
        properties: {
          dataTestId: schema.elementProperty(
            'data-test-id',
            property.string(),
            {
              role: 'metadata',
              target: target.element(ParagraphWithComponentPlugin),
            }
          ),
        },
      },
    });

    const editor = createEditor({
      plugins: [
        BlockPlaceholderPlugin,
        CustomMetadataPlugin,
        ParagraphWithComponentPlugin,
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          'data-test-id': 'block-1',
          type: 'paragraph',
        },
      ],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the placeholder map does not match the block type', async () => {
    const editor = createEditor({
      placeholders: { heading: 'Heading...' },
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the query returns false', async () => {
    const editor = createEditor({
      query: () => false,
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('passes the selected element type to the query', async () => {
    let queriedType: string | undefined;
    const editor = createEditor({
      query: ({ type }) => {
        queriedType = type;

        return true;
      },
    });

    const { mountedEditor } = renderPlaceholderEditor(editor);
    await focusEditor(mountedEditor);

    await waitFor(() => {
      expect(queriedType).toBe('paragraph');
    });
  });

  it('clears the target when the selection is expanded', async () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the editor is not focused', async () => {
    const editor = createEditor();
    const { container } = renderPlaceholderEditor(editor, { autoFocus: false });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target in read-only mode', async () => {
    const editor = createEditor();
    const { container } = renderPlaceholderEditor(editor, { readOnly: true });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('keeps placeholder state isolated between mounted views', async () => {
    const mountedViews: Array<ReturnType<typeof useEditorContext>> = [];
    function ViewProbe() {
      const viewEditor = useEditorContext();

      React.useLayoutEffect(() => {
        mountedViews.push(viewEditor);

        return () => {
          mountedViews.splice(mountedViews.indexOf(viewEditor), 1);
        };
      }, [viewEditor]);

      return null;
    }
    const ViewProbePlugin = definePlatePlugin('blockPlaceholderViewProbe', {
      slots: { afterEditable: ViewProbe },
    });
    const editor = createEditor({
      plugins: [ViewProbePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0], root: 'header:1' },
        focus: { offset: 0, path: [0, 0], root: 'header:1' },
      },
      value: {
        children: [
          {
            childRoots: { content: 'header:1' },
            children: [{ text: '' }],
            type: 'blockPlaceholderRootOwner',
          },
        ],
        roots: {
          'header:1': [
            { children: [{ text: '' }], type: 'paragraph' },
            { children: [{ text: 'filled' }], type: 'paragraph' },
          ],
        },
      },
    });
    const { getByTestId } = render(
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent data-testid="writable-view" root="header:1" />
        <PlateContent data-testid="read-only-view" readOnly root="header:1" />
      </Plate>
    );
    const editableView = getByTestId('writable-view');
    const readOnlyView = getByTestId('read-only-view');
    const writableEditor = mountedViews.find(
      (viewEditor) => !viewEditor.read.view.isReadOnly()
    );

    expect(mountedViews).toHaveLength(2);
    expect(writableEditor).toBeDefined();
    if (!writableEditor) throw new Error('Expected a writable mounted view.');
    expect({
      readOnly: mountedViews.map((viewEditor) =>
        viewEditor.read.view.isReadOnly()
      ),
      roots: mountedViews.map((viewEditor) => viewEditor.read.view.root()),
      writableMapsReadOnly: writableEditor.api.dom.editable() === readOnlyView,
      writableMapsWritable: writableEditor.api.dom.editable() === editableView,
    }).toEqual({
      readOnly: [false, true],
      roots: ['header:1', 'header:1'],
      writableMapsReadOnly: false,
      writableMapsWritable: true,
    });

    await React.act(async () => {
      writableEditor.api.dom.focus();
    });

    await waitFor(() => {
      expect(writableEditor.api.dom.isFocused()).toBe(true);
      expect(
        editableView.querySelector('[placeholder="Type something..."]')
      ).toBeInTheDocument();
      expect(readOnlyView.querySelector('[placeholder]')).toBeNull();
    });
  });

  it('hides the placeholder during composition', async () => {
    const editor = createEditor();
    const { getByTestId, mountedEditor } = renderPlaceholderEditor(editor);
    const editable = getByTestId('plite-content-editable');

    await focusEditor(mountedEditor);
    await waitFor(() => {
      expect(editable.querySelector('[placeholder]')).toBeInTheDocument();
    });

    fireEvent.compositionStart(editable);
    expect(mountedEditor.api.dom.isComposing()).toBe(true);
    await waitFor(() => {
      expect(editable.querySelector('[placeholder]') === null).toBe(true);
    });

    fireEvent.compositionEnd(editable);
    await waitFor(() => {
      expect(mountedEditor.api.dom.isComposing()).toBe(false);
      expect(editable.querySelector('[placeholder]')).toBeInTheDocument();
    });
  });

  it('tracks composition separately for two writable views', async () => {
    const mountedViews: Array<ReturnType<typeof useEditorContext>> = [];

    function ViewProbe() {
      const view = useEditorContext();

      React.useLayoutEffect(() => {
        mountedViews.push(view);

        return () => {
          mountedViews.splice(mountedViews.indexOf(view), 1);
        };
      }, [view]);

      return null;
    }

    const editor = createEditor({
      plugins: [
        definePlatePlugin('composingViewProbe', {
          slots: { afterEditable: ViewProbe },
        }),
      ],
    });
    const mounted = render(
      <Plate editor={editor} readOnly={false} suppressInstanceWarning>
        <PlateContent data-testid="first-view" />
        <Plate editor={editor} readOnly={false} suppressInstanceWarning>
          <PlateContent data-testid="second-view" />
        </Plate>
      </Plate>
    );
    const firstElement = mounted.getByTestId('first-view');
    const secondElement = mounted.getByTestId('second-view');
    const firstView = mountedViews.find(
      (view) => view.api.dom.editable() === firstElement
    );
    const secondView = mountedViews.find(
      (view) => view.api.dom.editable() === secondElement
    );

    if (!firstView || !secondView) {
      throw new Error('Expected both mounted views.');
    }
    expect(firstView).not.toBe(secondView);

    for (const [view, element, sibling] of [
      [firstView, firstElement, secondView],
      [secondView, secondElement, firstView],
    ] as const) {
      await React.act(async () => {
        view.api.dom.focus();
      });
      await waitFor(() => {
        expect(element.querySelector('[placeholder]')).toBeInTheDocument();
      });

      fireEvent.compositionStart(element);
      await waitFor(() => {
        expect({
          target: element.dataset.testid,
          domComposing: view.api.dom.isComposing(),
          siblingComposing: sibling.api.dom.isComposing(),
          placeholder: element.querySelector('[placeholder]') !== null,
        }).toEqual({
          target: element.dataset.testid,
          domComposing: true,
          siblingComposing: false,
          placeholder: false,
        });
      });

      fireEvent.compositionEnd(element);
      await waitFor(() => {
        expect(view.api.dom.isComposing()).toBe(false);
        expect(sibling.api.dom.isComposing()).toBe(false);
        expect(element.querySelector('[placeholder]')).toBeInTheDocument();
      });
    }

    mounted.unmount();
    expect(mountedViews).toHaveLength(0);
  });
});
