/** @jsx jsx */

import { createPlateEditor, ELEMENT_DEFAULT } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_H1 } from '../../../nodes/heading/src/constants';
import { createTrailingBlockPlugin } from './createTrailingBlockPlugin';

jsx;

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
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createTrailingBlockPlugin({
          options: {
            type: ELEMENT_DEFAULT,
            level: 0,
          },
        }),
      ],
    });

    editor.normalizeNode([input, []]);

    expect(input.children).toEqual(output.children);
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
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createTrailingBlockPlugin({
          options: {
            type: ELEMENT_DEFAULT,
            level: 1,
          },
        }),
      ],
    });

    editor.normalizeNode([input, []]);

    expect(input.children).toEqual(output.children);
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
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createTrailingBlockPlugin({
          options: {
            type: ELEMENT_DEFAULT,
            level: 0,
            exclude: [ELEMENT_H1],
          },
        }),
      ],
    });

    editor.normalizeNode([input, []]);

    expect(input.children).toEqual(output.children);
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
    const editor = createPlateEditor({
      editor: input,
      plugins: [createTrailingBlockPlugin()],
    });

    editor.normalizeNode([input, []]);

    expect(input.children).toEqual(output.children);
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
    const editor = createPlateEditor({
      editor: input,
      plugins: [createTrailingBlockPlugin()],
    });

    editor.normalizeNode([editor, []]);

    expect(editor.children).toEqual(output.children);
  });
});
