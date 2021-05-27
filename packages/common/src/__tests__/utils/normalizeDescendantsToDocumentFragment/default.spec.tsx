/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { normalizeDescendantsToDocumentFragment } from '../../../utils';

jsx;

const jsxEmptyTextNode = [''];

describe('normalizeDescendantsToDocumentFragment()', () => {
  it.each([
    {
      input: [<hp />],
      output: [<hp>{jsxEmptyTextNode}</hp>],
    },
    {
      input: [
        <hp>
          <hp />
        </hp>,
      ],
      output: [
        <hp>
          <hp>{jsxEmptyTextNode}</hp>
        </hp>,
      ],
    },
  ])(
    'should add a blank leaf to blocks without children',
    ({ input, output }: any) => {
      expect(normalizeDescendantsToDocumentFragment(input)).toEqual(output);
    }
  );
});
