/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { getPointFromLocation } from '.';
import { createTEditor } from '../createTEditor';

jsxt;

describe('getPointFromLocation', () => {
  describe('when path', () => {
    it('should return point with offset 0', () => {
      createTEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(getPointFromLocation({ at: [0, 0] })).toEqual({
        offset: 0,
        path: [0, 0],
      });
    });
  });

  describe('when point', () => {
    it('should return the same point', () => {
      createTEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      const point = {
        offset: 4,
        path: [0, 0],
      };

      expect(getPointFromLocation({ at: point })).toEqual(point);
    });
  });

  describe('when range', () => {
    it('should return anchor point by default', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(getPointFromLocation({ at: editor.selection })).toEqual({
        offset: 4,
        path: [0, 0],
      });
    });

    describe('when focus=true', () => {
      it('should return focus point', () => {
        const editor = createTEditor(
          (
            <editor>
              <hp>
                tes
                <anchor />
                tt
                <focus />
              </hp>
            </editor>
          ) as any
        );

        expect(
          getPointFromLocation({ at: editor.selection, focus: true })
        ).toEqual({
          offset: 5,
          path: [0, 0],
        });
      });
    });
  });
});
