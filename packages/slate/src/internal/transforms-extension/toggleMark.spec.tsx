/** @jsx jsxt */

import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../..';

jsxt;

describe('active', () => {
  const input = createEditor(
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
    input.tf.toggleMark(BoldPlugin.key);
    expect(input.children).toEqual(output.children);
  });
});

describe('clear', () => {
  const input = createEditor(
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

  const output = createEditor(
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
    input.tf.toggleMark(ItalicPlugin.key, { remove: BoldPlugin.key });
    expect(input.children).toEqual(output.children);
  });
});

describe('inactive', () => {
  const input = createEditor(
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

  const output = createEditor(
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
    input.tf.toggleMark(BoldPlugin.key);
    expect(input.children).toEqual(output.children);
  });
});
