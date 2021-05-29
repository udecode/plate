/** @jsx jsx */

import { ELEMENT_DEFAULT } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { ELEMENT_H1 } from '../../elements/heading/src/defaults';
import { withTrailingBlock } from './createTrailingBlockPlugin';

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
    const editor = withTrailingBlock({
      type: ELEMENT_DEFAULT,
      level: 0,
    })(input as Editor);

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
    const editor = withTrailingBlock({
      type: ELEMENT_DEFAULT,
      level: 1,
    })(input as Editor);

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
    const editor = withTrailingBlock({
      type: ELEMENT_DEFAULT,
      level: 0,
      exclude: [ELEMENT_H1],
    })(input as Editor);

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
    const editor = withTrailingBlock()(input as Editor);

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
    const editor = withTrailingBlock()(input as Editor);

    editor.normalizeNode([input, []]);

    expect(input.children).toEqual(output.children);
  });
});
