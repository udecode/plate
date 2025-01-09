/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../create-editor';
import { PointApi } from './point';

jsxt;

describe('PointApi.get', () => {
  describe('when path', () => {
    it('should return point with offset 0', () => {
      createEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(PointApi.get([0, 0])).toEqual({
        offset: 0,
        path: [0, 0],
      });
    });
  });

  describe('when point', () => {
    it('should return the same point', () => {
      createEditor(
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

      expect(PointApi.get(point)).toEqual(point);
    });
  });

  describe('when range', () => {
    it('should return anchor point by default', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(PointApi.get(editor.selection)).toEqual({
        offset: 4,
        path: [0, 0],
      });
    });

    describe('when focus=true', () => {
      it('should return focus point', () => {
        const editor = createEditor(
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

        expect(PointApi.get(editor.selection, { focus: true })).toEqual({
          offset: 5,
          path: [0, 0],
        });
      });
    });
  });
});
