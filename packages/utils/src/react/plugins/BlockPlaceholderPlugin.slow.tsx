/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { createBasePlugin } from '@platejs/core';
import {
  createPlateEditor,
  ParagraphPlugin,
  type PlateEditor,
} from '@platejs/core/react';
import { PlateTest } from '@platejs/core/react/test';
import {
  type Element,
  property,
  schema,
  target,
  type TextSelection,
  type Value,
} from '@platejs/plite';
import { render, waitFor } from '@testing-library/react';

import {
  BlockPlaceholderPlugin,
  type BlockPlaceholderConfig,
} from './BlockPlaceholderPlugin';

const BlockPlaceholderFixtureSchemaPlugin = createBasePlugin({
  key: 'blockPlaceholderFixtureSchema',
  schema: {
    properties: [
      schema.elementProperty('indent', property.number(), {
        target: target.type('p'),
      }),
      schema.elementProperty('listStyleType', property.string(), {
        target: target.type('p'),
      }),
    ],
  },
});
const ParagraphWithComponentPlugin = ParagraphPlugin.configure({
  component: ({ attributes, children }) => (
    <div {...attributes}>{children}</div>
  ),
});

const renderPlaceholderEditor = (
  editor: PlateEditor,
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
  nodeId?: boolean;
  placeholders?: Record<string, string>;
  query?: BlockPlaceholderConfig['initialState']['query'];
  readOnly?: boolean;
  selection?: TextSelection;
  value?: Value;
}) =>
  createPlateEditor({
    plugins: [
      BlockPlaceholderFixtureSchemaPlugin,
      ParagraphWithComponentPlugin,
      BlockPlaceholderPlugin.configure({
        initialState: {
          ...(options?.className !== undefined
            ? { className: options.className }
            : {}),
          ...(options?.placeholders !== undefined
            ? { placeholders: options.placeholders }
            : {}),
          ...(options?.query !== undefined ? { query: options.query } : {}),
        },
      }),
    ],
    nodeId: options?.nodeId,
    selection: options?.selection ?? {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: options?.value ?? [
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'filled' }], type: 'p' },
    ],
  });

const getPlaceholder = <TEditor extends PlateEditor>(
  editor: TEditor,
  node: Element
) =>
  editor
    .plugin(BlockPlaceholderPlugin)
    .store.get('placeholder', editor.read.nodes.path(node));

const getEditorElement = <TEditor extends PlateEditor>(
  editor: TEditor,
  index: number
): Element => {
  const node = editor.read.children()[index];

  if (!node) {
    throw new Error(`Missing editor child at index ${index}`);
  }

  return node;
};

const focusEditor = async (editor: PlateEditor) => {
  await React.act(async () => {
    editor.api.dom.focus();
  });
};

describe('BlockPlaceholderPlugin', () => {
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
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the only empty block has id metadata', async () => {
    const editor = createEditor({
      nodeId: true,
      value: [{ children: [{ text: '' }], id: 'block-1', type: 'p' }],
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
          listStyleType: 'disc',
          type: 'p',
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
    const CustomMetadataPlugin = createBasePlugin({
      key: 'customMetadata',
      schema: {
        properties: [
          schema.elementProperty(
            'data-test-id',
            property.string({ significant: false }),
            { target: target.type('p') }
          ),
        ],
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
          type: 'p',
        },
      ],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, getEditorElement(editor, 0))).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the placeholder map does not match the block type', async () => {
    const editor = createEditor({
      placeholders: { h1: 'Heading...' },
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
