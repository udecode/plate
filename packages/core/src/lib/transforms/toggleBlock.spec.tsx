/** @jsx jsxt */

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { jsxt } from '@udecode/plate-test-utils';
import { createTEditor } from '@udecode/slate';

import { createPlateEditor } from '../../react';

jsxt;

describe('active', () => {
  const input = createTEditor(
    (
      <editor>
        <hblockquote>
          test
          <cursor />
        </hblockquote>
      </editor>
    ) as any
  );

  const output = createTEditor(
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
  const input = createTEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  const output = createTEditor(
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
