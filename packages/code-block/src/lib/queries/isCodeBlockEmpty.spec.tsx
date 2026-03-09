/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor, createSlateEditor } from 'platejs';

import { isCodeBlockEmpty } from './isCodeBlockEmpty';

jsxt;

describe('isCodeBlockEmpty', () => {
  const run = (input: any) =>
    isCodeBlockEmpty(createSlateEditor({ editor: createEditor(input) }));

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
      'returns false for a multi-line code block',
      <editor>
        <hcodeblock>
          <hcodeline>
            <htext />
            <cursor />
          </hcodeline>
          <hcodeline>
            <htext />
          </hcodeline>
        </hcodeblock>
      </editor>,
      false,
    ],
    [
      'returns false for a non-empty code line',
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
      'returns true for a single empty code line',
      <editor>
        <hcodeblock>
          <hcodeline>
            <htext />
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>,
      true,
    ],
  ])('%s', (_label, input, expected) => {
    expect(run(input)).toBe(expected);
  });
});
