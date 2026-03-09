/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { ParagraphPlugin } from 'platejs/react';

import { normalizeRoot } from '../__tests__/normalizeRoot';
import { TrailingBlockPlugin } from './TrailingBlockPlugin';

jsxt;

describe('TrailingBlockPlugin', () => {
  it.each([
    {
      input: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
        </editor>
      ) as any,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as any,
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
          <element>
            <hh1>test</hh1>
            <hh1>test2</hh1>
          </element>
        </editor>
      ) as any,
      output: (
        <editor>
          <element>
            <hh1>test</hh1>
            <hh1>test2</hh1>
            <hdefault>
              <htext />
            </hdefault>
          </element>
        </editor>
      ) as any,
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
      ) as any,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
        </editor>
      ) as any,
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            exclude: ['h1'],
            level: 0,
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
      ) as any,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh1>test2</hh1>
          <hdefault>default</hdefault>
        </editor>
      ) as any,
      plugins: [TrailingBlockPlugin],
      title: 'keeps an existing trailing block unchanged',
    },
    {
      input: (<editor />) as any,
      output: (
        <editor>
          <hdefault>
            <htext />
          </hdefault>
        </editor>
      ) as any,
      plugins: [TrailingBlockPlugin],
      title: 'inserts a trailing block into an empty editor',
    },
  ])('$title', ({ input, output, plugins }) => {
    const editor = normalizeRoot({
      plugins,
      selection: input.selection,
      value: input.children,
    });

    expect(editor.children).toEqual(output.children);
  });
});
