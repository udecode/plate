/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('range', () => {
  describe('when getting range between two locations', () => {
    const input = createEditor(
      (
        <editor>
          <hp>
            first <anchor />
            text
          </hp>
          <hp>
            second <focus />
            text
          </hp>
        </editor>
      ) as any
    );

    const output = {
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 7, path: [1, 0] },
    };

    it('should return range between locations', () => {
      expect(
        input.api.range(
          { offset: 6, path: [0, 0] },
          { offset: 7, path: [1, 0] }
        )
      ).toEqual(output);
    });
  });
});

describe('before', () => {
  describe('default', () => {
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

    const output = {
      anchor: {
        offset: 3,
        path: [0, 0],
      },
      focus: {
        offset: 4,
        path: [0, 0],
      },
    };

    it('should be', () => {
      expect(input.api.range('before', input.selection!)).toEqual(output);
    });
  });

  describe('when at start', () => {
    const input = createEditor(
      (
        <editor>
          <hp>
            <cursor />
            test
          </hp>
        </editor>
      ) as any
    );

    const output = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };

    it('should return range at start', () => {
      expect(input.api.range('before', input.selection!)).toEqual(output);
    });
  });
});

describe('from block start', () => {
  describe('when no block', () => {
    const input = createEditor(
      (
        <editor>
          te
          <cursor />
          st
        </editor>
      ) as any
    );

    it('should be undefined', () => {
      expect(input.api.range('start', input.selection!)).toEqual(undefined);
    });
  });

  describe('when no selection', () => {
    const input = createEditor(
      (
        <editor>
          <hp>test</hp>
        </editor>
      ) as any
    );

    it('should be undefined', () => {
      expect(input.api.range('start', input.selection!)).toEqual(undefined);
    });
  });

  describe('when selection', () => {
    const input = createEditor(
      (
        <editor>
          <hp>
            te
            <cursor />
            st
          </hp>
        </editor>
      ) as any
    );

    const output = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    it('should return range from block start', () => {
      expect(input.api.range('start', input.selection!)).toEqual(output);
    });
  });
});
