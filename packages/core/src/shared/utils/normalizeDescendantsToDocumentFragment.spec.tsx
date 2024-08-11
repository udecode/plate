/** @jsx jsx */
import { LinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';

import { createPlateEditor } from '../../client';
import { normalizeDescendantsToDocumentFragment } from './index';

jsx;

describe('normalizeDescendantsToDocumentFragment()', () => {
  it.each([
    {
      input: [<hp />],
      output: [
        <hp>
          <htext />
        </hp>,
      ],
    },
    {
      input: [
        <hp>
          <hp />
        </hp>,
      ],
      output: [
        <hp>
          <hp>
            <htext />
          </hp>
        </hp>,
      ],
    },
  ])(
    'should add a blank leaf to blocks without children',
    ({ input, output }: any) => {
      const editor = createPlateEditor();

      const result = normalizeDescendantsToDocumentFragment(editor, {
        descendants: input,
      });
      expect(result).toEqual(output);
    }
  );

  it.each([
    {
      input: [<htext>text node</htext>, <htext>another text node</htext>],
      output: [<htext>text node</htext>, <htext>another text node</htext>],
    },
    {
      input: [<ha>inline element</ha>, <htext>text node</htext>],
      output: [<ha>inline element</ha>, <htext>text node</htext>],
    },
    {
      input: [<hp>block</hp>, <hp>another block</hp>, <htext>text node</htext>],
      output: [<hp>block</hp>, <hp>another block</hp>, <hp>text node</hp>],
    },
    {
      input: [<ha>inline element</ha>, <hp>block</hp>],
      output: [
        <hp>
          <ha>inline element</ha>
        </hp>,
        <hp>block</hp>,
      ],
    },
    {
      input: [
        <htext>text 1</htext>,
        <htext>text 2</htext>,
        <hp>block</hp>,
        <htext>text 3</htext>,
        <htext>text 4</htext>,
      ],
      output: [
        <hp>
          <htext>text 1</htext>
          <htext>text 2</htext>
        </hp>,
        <hp>block</hp>,
        <hp>
          <htext>text 3</htext>
          <htext>text 4</htext>
        </hp>,
      ],
    },
    {
      input: [
        <hp>
          <htext>text node</htext>
          <hp>block</hp>
        </hp>,
      ],
      output: [
        <hp>
          <hp>text node</hp>
          <hp>block</hp>
        </hp>,
      ],
    },
  ])(
    'should wrap inline blocks and text nodes in case they have a sibling block',
    ({ input, output }: any) => {
      const editor = createPlateEditor({
        plugins: [LinkPlugin],
      });

      const result = normalizeDescendantsToDocumentFragment(editor, {
        descendants: input,
      });
      expect(result).toEqual(output);
    }
  );
});
