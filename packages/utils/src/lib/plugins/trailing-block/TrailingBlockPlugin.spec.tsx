/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { ParagraphPlugin } from '@platejs/core/react';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import {
  fixtureSchemaPlugins,
  normalizeRoot,
} from '../__tests__/normalizeRoot';
import { TrailingBlockPlugin } from './TrailingBlockPlugin';

jsxt;

describe('TrailingBlockPlugin', () => {
  it('uses the editor paragraph type as the default trailing block type', () => {
    const editor = createBaseEditor({
      plugins: [...fixtureSchemaPlugins, TrailingBlockPlugin],
      initialValue: [{ type: 'h1', children: [{ text: 'x' }] }],
    });

    expect(editor.getPlugin(TrailingBlockPlugin).options.type).toBe(
      editor.getType(ParagraphPlugin.key)
    );
  });

  it.each([
    {
      input: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            level: 0,
            type: ParagraphPlugin.key,
          },
        }),
      ],
      title:
        'appends a trailing block at the root when the last node is invalid',
    },
    {
      input: (
        <editor>
          <element type="element">
            <hh1>test</hh1>
            <hh1>test2</hh1>
          </element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="element">
            <hh1>test</hh1>
            <hh1>test2</hh1>
            <hdefault>
              <htext />
            </hdefault>
          </element>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            level: 1,
            type: ParagraphPlugin.key,
          },
        }),
      ],
      title: 'appends the trailing block at the configured depth',
    },
    {
      input: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            level: 0,
            match: (node) => !('type' in node) || node.type !== 'h1',
            type: ParagraphPlugin.key,
          },
        }),
      ],
      title: 'skips insertion when the last node is excluded by the query',
    },
    {
      input: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
          <hdefault>default</hdefault>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
          <hdefault>default</hdefault>
        </editor>
      ) as TestEditor,
      plugins: [TrailingBlockPlugin],
      title: 'keeps an existing trailing block unchanged',
    },
    {
      input: (<editor />) as TestEditor,
      output: (
        <editor>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as TestEditor,
      plugins: [TrailingBlockPlugin],
      title: 'inserts a trailing block into an empty editor',
    },
  ])('$title', ({ input, output, plugins }) => {
    const normalized = normalizeRoot({
      plugins,
      selection: input.selection,
      value: input.children,
    });

    expect(normalized.children).toEqual(output.children);
  });
});
