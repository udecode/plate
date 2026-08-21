/// <reference types="@testing-library/jest-dom" />

import { defineBasePlugin, ElementIdPlugin } from '@platejs/core';
import { createPlateEditor, ParagraphPlugin } from '@platejs/core/react';
import type { InternalPlateEditorWithInstalledPlugins } from '@platejs/core/react/internal';
import { PlateTest } from '@platejs/core/react/test';
import {
  createEditor as createPliteEditor,
  type Element,
  property,
  schema,
  target,
  type TextSelection,
  type Value,
} from '@platejs/plite';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

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

const renderPlaceholderEditor = <V extends Value, D>(
  editor: InternalPlateEditorWithInstalledPlugins<V, D>,
  options?: { autoFocus?: boolean; readOnly?: boolean }
) =>
  render(
    <PlateTest
      editableProps={{ autoFocus: options?.autoFocus ?? false }}
      editor={editor}
      readOnly={options?.readOnly}
      suppressInstanceWarning
    >
      {null}
    </PlateTest>
  );

const createEditor = (options?: {
  className?: string;
  elementIds?: boolean;
  placeholders?: Record<string, string>;
  query?: BlockPlaceholderDefinition['initialState']['query'];
  readOnly?: boolean;
  selection?: TextSelection;
  value?: Value;
}) =>
  createPlateEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      ...(options?.elementIds ? [ElementIdPlugin] : []),
      BlockPlaceholderFixtureSchemaPlugin,
      ParagraphWithComponentPlugin,
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

const getPlaceholder = <V extends Value, D>(
  editor: InternalPlateEditorWithInstalledPlugins<V, D>,
  node: Element
) =>
  editor
    .plugin(BlockPlaceholderPlugin)
    .store.get('placeholder', editor.read.nodes.path(node));

const getEditorElement = <V extends Value, D>(
  editor: InternalPlateEditorWithInstalledPlugins<V, D>,
  index: number
): Element => {
  const node = editor.read.children()[index];

  if (!node) {
    throw new Error(`Missing editor child at index ${index}`);
  }

  return node;
};

const focusEditor = async <V extends Value, D>(
  editor: InternalPlateEditorWithInstalledPlugins<V, D>
) => {
  await React.act(async () => {
    editor.api.dom.focus();
  });
};

describe('block placeholder behavior', () => {
  it('sets the target for an active empty block and injects placeholder props', async () => {
    const editor = createEditor({ className: 'placeholder-class' });
    const { container } = renderPlaceholderEditor(editor);
    const firstNode = getEditorElement(editor, 0);
    const secondNode = getEditorElement(editor, 1);

    await focusEditor(editor);

    await waitFor(() => {
      expect(getPlaceholder(editor, firstNode)).toBe('Type something...');
      expect(getPlaceholder(editor, secondNode)).toBeUndefined();
      expect(
        container.querySelector('[placeholder="Type something..."]')
      ).toHaveClass('placeholder-class');
    });
  });

  it('clears the target when the editor is globally empty', async () => {
    const editor = createEditor({
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the only empty block has id metadata', async () => {
    const editor = createEditor({
      elementIds: true,
      value: [{ children: [{ text: '' }], id: 'block-1', type: 'paragraph' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

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
    const { container } = renderPlaceholderEditor(editor);
    const firstNode = getEditorElement(editor, 0);

    await focusEditor(editor);

    await waitFor(() => {
      expect(getPlaceholder(editor, firstNode)).toBe('Type something...');
    });

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

    const editor = createPlateEditor({
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
      initialValue: [
        {
          children: [{ text: '' }],
          'data-test-id': 'block-1',
          type: 'paragraph',
        },
      ],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the placeholder map does not match the block type', async () => {
    const editor = createEditor({
      placeholders: { heading: 'Heading...' },
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the query returns false', async () => {
    const editor = createEditor({
      query: () => false,
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

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

    renderPlaceholderEditor(editor);
    await focusEditor(editor);

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

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the editor is not focused', async () => {
    const editor = createEditor();
    const { container } = renderPlaceholderEditor(editor, { autoFocus: false });

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target in read-only mode', async () => {
    const editor = createEditor();
    const { container } = renderPlaceholderEditor(editor, { readOnly: true });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });
});
