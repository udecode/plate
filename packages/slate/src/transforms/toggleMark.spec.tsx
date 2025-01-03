/** @jsx jsxt */

import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor, toggleMark } from '..';

jsxt;

describe('active', () => {
  const input = createTEditor(
    (
      <editor>
        <hp>
          tes
          <htext bold>t</htext>
        </hp>
        <selection>
          <anchor offset={0} path={[0, 1]} />
          <focus offset={1} path={[0, 1]} />
        </selection>
      </editor>
    ) as any
  );

  const output = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should be', () => {
    toggleMark(input, { key: BoldPlugin.key });
    expect(input.children).toEqual(output.children);
  });
});

describe('clear', () => {
  const input = createTEditor(
    (
      <editor>
        <hp>
          <htext bold>test</htext>
        </hp>
        <selection>
          <anchor offset={0} path={[0, 0]} />
          <focus offset={4} path={[0, 0]} />
        </selection>
      </editor>
    ) as any
  );

  const output = createTEditor(
    (
      <editor>
        <hp>
          <htext italic>test</htext>
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  it('should be', () => {
    toggleMark(input, { key: ItalicPlugin.key, clear: BoldPlugin.key });
    expect(input.children).toEqual(output.children);
  });
});

describe('inactive', () => {
  const input = createTEditor(
    (
      <editor>
        <hp>test</hp>
        <selection>
          <anchor offset={3} path={[0, 0]} />
          <focus offset={4} path={[0, 0]} />
        </selection>
      </editor>
    ) as any
  );

  const output = createTEditor(
    (
      <editor>
        <hp>
          tes
          <htext bold>t</htext>
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  it('should be', () => {
    toggleMark(input, { key: BoldPlugin.key });
    expect(input.children).toEqual(output.children);
  });
});