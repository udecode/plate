/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { isCodeBlockEmpty } from './isCodeBlockEmpty';

jsxt;

describe('isCodeBlockEmpty', () => {
  it('should be false when not in a code block', () => {
    const input = (
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
      </editor>
    ) as any as SlateEditor;

    expect(isCodeBlockEmpty(createPlateEditor({ editor: input }))).toBe(false);
  });

  it('should be false when in a code block with multiple lines', () => {
    const input = (
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
      </editor>
    ) as any as SlateEditor;

    expect(isCodeBlockEmpty(createPlateEditor({ editor: input }))).toBe(false);
  });

  it('should be false when in a non-empty code line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            test
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    expect(isCodeBlockEmpty(createPlateEditor({ editor: input }))).toBe(false);
  });

  it('should be true when in an empty code line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <htext />
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    expect(isCodeBlockEmpty(createPlateEditor({ editor: input }))).toBe(true);
  });
});
