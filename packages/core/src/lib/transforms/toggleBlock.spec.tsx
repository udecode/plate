/** @jsx jsxt */

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { jsxt } from '@udecode/plate-test-utils';
import { createEditor } from '@udecode/slate';

import { createPlateEditor } from '../../react';

jsxt;

describe('active', () => {
  const input = createEditor(
    (
      <editor>
        <hblockquote>
          test
          <cursor />
        </hblockquote>
      </editor>
    ) as any
  );

  const output = createEditor(
    (
      <editor>
        <hdefault>
          test
          <cursor />
        </hdefault>
      </editor>
    ) as any
  );

  it('should be', () => {
    const editor = createPlateEditor({ editor: input });
    editor.tf.toggle.block({ type: 'blockquote' });

    expect(editor.children).toEqual(output.children);
  });
});

describe('inactive', () => {
  const input = createEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  const output = createEditor(
    (
      <editor>
        <hblockquote>
          test
          <cursor />
        </hblockquote>
      </editor>
    ) as any
  );

  it('should be', () => {
    const editor = createPlateEditor({ editor: input });
    editor.tf.toggle.block({ type: BlockquotePlugin.key });

    expect(editor.children).toEqual(output.children);
  });
});
