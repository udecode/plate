/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { createSlatePlugin } from '@platejs/core';
import { createPlateEditor, PlateTest } from '@platejs/core/react';
import { render, waitFor } from '@testing-library/react';

import { BlockPlaceholderPlugin } from './BlockPlaceholderPlugin';

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

describe('BlockPlaceholderPlugin', () => {
  it('sets the target for an active empty block and injects placeholder props', async () => {
    const editor = createEditor({ className: 'placeholder-class' });
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );
    const firstNode = editor.children[0] as any;
    const secondNode = editor.children[1] as any;

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toEqual({
        node: firstNode,
        placeholder: 'Type something...',
      });
    });

    expect(
      editor.getOption(BlockPlaceholderPlugin, 'placeholder', firstNode)
    ).toBe('Type something...');
    expect(
      editor.getOption(BlockPlaceholderPlugin, 'placeholder', secondNode)
    ).toBeUndefined();

    const element = container.querySelector(
      '[placeholder="Type something..."]'
    );

    expect(element).toHaveClass('placeholder-class');
  });

  it('clears the target when the editor is globally empty', async () => {
    const editor = createEditor({
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the only empty block has id metadata', async () => {
    const editor = createEditor({
      nodeId: true,
      value: [{ children: [{ text: '' }], id: 'block-1', type: 'p' }],
    });
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

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
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );
    const firstNode = editor.children[0] as any;

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toEqual({
        node: firstNode,
        placeholder: 'Type something...',
      });
    });

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
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the placeholder map does not match the block type', async () => {
    const editor = createEditor({
      placeholders: { h1: 'Heading...' },
    });
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the query returns false', async () => {
    const editor = createEditor({
      query: () => false,
    });
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target when the selection is expanded', async () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });
    const { container } = render(
      <PlateTest editor={editor} suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });

  it('clears the target in read-only mode', async () => {
    const editor = createEditor();
    const { container } = render(
      <PlateTest editor={editor} readOnly suppressInstanceWarning>
        {null}
      </PlateTest>
    );

    await waitFor(() => {
      expect(editor.getOptions(BlockPlaceholderPlugin)._target).toBeNull();
    });

    expect(container.querySelector('[placeholder]')).toBeNull();
  });
});
