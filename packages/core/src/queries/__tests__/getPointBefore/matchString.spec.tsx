/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getPointBeforeLocation } from '../../../../../slate-utils/src/queries/getPointBeforeLocation';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

describe('when skipInvalid is true', () => {
  describe('when matchString is a character', () => {
    it('should be', () => {
      const input = ((
        <editor>
          <hp>
            test http://google.com
            <cursor />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = { offset: 4, path: [0, 0] };

      expect(
        getPointBeforeLocation(input, input.selection as any, {
          matchString: ' ',
          skipInvalid: true,
        })
      ).toEqual(output);
    });
  });

  describe('when matchString is multiple characters', () => {
    it('should be', () => {
      const input = ((
        <editor>
          <hp>
            find **test
            <cursor />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = {
        offset: 5,
        path: [0, 0],
      };

      expect(
        getPointBeforeLocation(input, input.selection as any, {
          skipInvalid: true,
          matchString: '**',
        })
      ).toEqual(output);
    });
  });

  describe('when matchString is a character and not in the editor', () => {
    it('should be undefined', () => {
      const input = ((
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = undefined;

      expect(
        getPointBeforeLocation(input, input.selection as any, {
          matchString: 'a',
          skipInvalid: true,
        })
      ).toEqual(output);
    });
  });
});

describe('when skipInvalid is false', () => {
  describe('when matchString is multiple characters', () => {
    it('should be', () => {
      const input = ((
        <editor>
          <hp>
            find ***__
            <cursor />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = {
        offset: 5,
        path: [0, 0],
      };

      expect(
        getPointBeforeLocation(input, input.selection as any, {
          matchString: '***__',
        })
      ).toEqual(output);
    });
  });

  describe('when matchString is an array of string', () => {
    it('should be', () => {
      const input = ((
        <editor>
          <hp>
            find ***__
            <cursor />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = {
        offset: 5,
        path: [0, 0],
      };

      expect(
        getPointBeforeLocation(input, input.selection as any, {
          matchString: ['/', '***__', '/'],
        })
      ).toEqual(output);
    });
  });
});
