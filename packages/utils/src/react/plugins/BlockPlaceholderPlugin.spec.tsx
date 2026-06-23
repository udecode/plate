/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { createSlatePlugin } from '@platejs/core';
import { createPlateEditor, PlateTest } from '@platejs/core/react';
import { render } from '@testing-library/react';

import { BlockPlaceholderPlugin } from './BlockPlaceholderPlugin';

const renderPlaceholderEditor = (
  editor: any,
  options?: { readOnly?: boolean }
) =>
  render(
    <PlateTest
      editableProps={{ autoFocus: false }}
      editor={editor}
      readOnly={options?.readOnly}
      suppressInstanceWarning
    >
      {null}
    </PlateTest>
  );

const createEditor = (options?: {
  className?: string;
  nodeId?: any;
  placeholders?: Record<string, string>;
  query?: (context: any) => boolean;
  readOnly?: boolean;
  selection?: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  };
  value?: any[];
}) =>
  createPlateEditor({
    plugins: [
      BlockPlaceholderPlugin.configure({
        options: {
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
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: options?.value ?? [
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'filled' }], type: 'p' },
    ],
  });

const getPlaceholder = (
  editor: ReturnType<typeof createEditor>,
  node: any,
  path: number[]
) =>
  (
    editor.getOption as (
      plugin: typeof BlockPlaceholderPlugin,
      key: 'placeholder',
      node: any,
      path: number[]
    ) => string | undefined
  )(BlockPlaceholderPlugin, 'placeholder', node, path);

describe('BlockPlaceholderPlugin', () => {
  it('sets the target for an active empty block and injects placeholder props', async () => {
    const editor = createEditor({ className: 'placeholder-class' });
    const { container } = renderPlaceholderEditor(editor);
    const firstNode = editor.children[0] as any;
    const secondNode = editor.children[1] as any;

    expect(getPlaceholder(editor, firstNode, [0])).toBe('Type something...');
    expect(getPlaceholder(editor, secondNode, [1])).toBeUndefined();

    const element = container.querySelector(
      '[placeholder="Type something..."]'
    );

    expect(element).toHaveClass('placeholder-class');
  });

  it('clears the target when the editor is globally empty', async () => {
    const editor = createEditor({
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, editor.children[0] as any, [0])).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the only empty block has id metadata', async () => {
    const editor = createEditor({
      nodeId: true,
      value: [{ children: [{ text: '' }], id: 'block-1', type: 'p' }],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, editor.children[0] as any, [0])).toBeUndefined();

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
    const firstNode = editor.children[0] as any;

    expect(getPlaceholder(editor, firstNode, [0])).toBe('Type something...');

    expect(
      container.querySelector('[placeholder="Type something..."]')
    ).toBeInTheDocument();
  });

  it('honors custom node metadata rules for pristine empty blocks', async () => {
    const CustomMetadataPlugin = createSlatePlugin({
      key: 'customMetadata',
    }).extend({
      node: {
        isMetadataProp: ({ key }) => key === 'data-test-id',
      },
    });

    const editor = createPlateEditor({
      plugins: [BlockPlaceholderPlugin, CustomMetadataPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          'data-test-id': 'block-1',
          type: 'p',
        },
      ],
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, editor.children[0] as any, [0])).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the placeholder map does not match the block type', async () => {
    const editor = createEditor({
      placeholders: { h1: 'Heading...' },
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, editor.children[0] as any, [0])).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the query returns false', async () => {
    const editor = createEditor({
      query: () => false,
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, editor.children[0] as any, [0])).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the selection is expanded', async () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });
    const { container } = renderPlaceholderEditor(editor);

    expect(getPlaceholder(editor, editor.children[0] as any, [0])).toBeUndefined();

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target in read-only mode', async () => {
    const editor = createEditor();
    const { container } = renderPlaceholderEditor(editor, { readOnly: true });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });
});
