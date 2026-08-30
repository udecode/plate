/** @jsx jsxt */

import { createEditor } from 'platejs';
import { ParagraphPlugin } from 'platejs/react';

import { jsxt, type TestEditor } from '../../testing';
import { fixtureSchemaPlugins, normalizeRoot } from './__tests__/normalizeRoot';
import { TrailingBlockPlugin } from './TrailingBlockPlugin';

jsxt;

describe('TrailingBlockPlugin', () => {
  it('uses the editor paragraph type as the default trailing block type', () => {
    const editor = createEditor({
      plugins: [...fixtureSchemaPlugins, TrailingBlockPlugin],
      initialValue: [{ type: 'h1', children: [{ text: 'x' }] }],
    });

    expect(editor.plugin(TrailingBlockPlugin).initialState.type).toBe(
      editor.plugin(ParagraphPlugin.name).name
    );
  });

  it('wraps insertion without exposing the active transaction', () => {
    let insertCount = 0;
    const normalized = normalizeRoot({
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            insert: (insert) => {
              insertCount += 1;
              insert();
            },
          },
        }),
      ],
      value: [{ type: 'h1', children: [{ text: 'x' }] }],
    });

    expect(insertCount).toBe(1);
    expect(normalized.children).toHaveLength(2);
  });

  it.each([
    {
      input: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            level: 0,
            type: 'paragraph',
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
            <element type="h1">test</element>
            <element type="h1">test2</element>
          </element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="element">
            <element type="h1">test</element>
            <element type="h1">test2</element>
            <hdefault>
              <htext />
            </hdefault>
          </element>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            level: 1,
            type: 'paragraph',
          },
        }),
      ],
      title: 'appends the trailing block at the configured depth',
    },
    {
      input: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
        </editor>
      ) as TestEditor,
      plugins: [
        TrailingBlockPlugin.configure({
          initialState: {
            level: 0,
            match: (node) => !('type' in node) || node.type !== 'h1',
            type: 'paragraph',
          },
        }),
      ],
      title: 'skips insertion when the last node is excluded by the query',
    },
    {
      input: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
          <hdefault>default</hdefault>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h1">test2</element>
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
