/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor, createSlateEditor } from 'platejs';

import { isSelectionAtCodeBlockStart } from './isSelectionAtCodeBlockStart';

jsxt;

describe('isSelectionAtCodeBlockStart', () => {
  const run = (input: any) =>
    isSelectionAtCodeBlockStart(
      createSlateEditor({ editor: createEditor(input) })
    );

  it.each([
    [
      'returns false outside a code block',
      <editor>
        <hp>
          <htext />
          <cursor />
        </hp>
        <hcodeblock>
          <hcodeline>
            <htext />
          </hcodeline>
        </hcodeblock>
      </editor>,
      false,
    ],
    [
      'returns false on a later code line',
      <editor>
        <hcodeblock>
          <hcodeline>
            <htext />
          </hcodeline>
          <hcodeline>
            <htext />
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>,
      false,
    ],
    [
      'returns false when the cursor is not at the line start',
      <editor>
        <hcodeblock>
          <hcodeline>
            test
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>,
      false,
    ],
    [
      'returns true at the start of the first code line',
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
            line 1
          </hcodeline>
          <hcodeline>line 2</hcodeline>
        </hcodeblock>
      </editor>,
      true,
    ],
  ])('%s', (_label, input, expected) => {
    expect(run(input)).toBe(expected);
  });
});
