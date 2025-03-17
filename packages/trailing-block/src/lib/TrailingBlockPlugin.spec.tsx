/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';
import { ParagraphPlugin } from '@udecode/plate/react';

import { TrailingBlockPlugin } from './TrailingBlockPlugin';

jsxt;

describe('when last node is invalid', () => {
  const input = (
    <editor>
      <hh1>test</hh1>
      <hh1>test2</hh1>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hh1>test</hh1>
      <hh1>test2</hh1>
      <hdefault>
        <htext />
      </hdefault>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            level: 0,
            type: ParagraphPlugin.key,
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalizeNode([input, []]);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when level = 1', () => {
  const input = (
    <editor>
      <element>
        <hh1>test</hh1>
        <hh1>test2</hh1>
      </element>
    </editor>
  ) as any;

  const output = (
    <editor>
      <element>
        <hh1>test</hh1>
        <hh1>test2</hh1>
        <hdefault>
          <htext />
        </hdefault>
      </element>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            level: 1,
            type: ParagraphPlugin.key,
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalizeNode([input, []]);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when using query', () => {
  const input = (
    <editor>
      <hh1>test</hh1>
      <hh1>test2</hh1>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hh1>test</hh1>
      <hh1>test2</hh1>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: {
            exclude: [HEADING_KEYS.h1],
            level: 0,
            type: ParagraphPlugin.key,
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalizeNode([input, []]);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when the last node is valid', () => {
  const input = (
    <editor>
      <hh1>test</hh1>
      <hh1>test2</hh1>
      <hdefault>default</hdefault>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hh1>test</hh1>
      <hh1>test2</hh1>
      <hdefault>default</hdefault>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      plugins: [TrailingBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalizeNode([input, []]);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when editor has no children', () => {
  const input = (<editor />) as any;

  const output = (
    <editor>
      <hdefault>
        <htext />
      </hdefault>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      plugins: [TrailingBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalizeNode([editor, []]);

    expect(editor.children).toEqual(output.children);
  });
});
