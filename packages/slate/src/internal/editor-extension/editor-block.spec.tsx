/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('block', () => {
  describe('when no options', () => {
    const input = createEditor(
      (
        <editor>
          <hp>
            1<cursor />
          </hp>
        </editor>
      ) as any
    );

    it('should get block at selection', () => {
      const res = input.api.block();

      expect(res).toEqual([{ children: [{ text: '1' }], type: 'p' }, [0]]);
    });
  });

  describe('when at option', () => {
    const input = createEditor(
      (
        <editor>
          <hp>1</hp>
          <hul>
            <hli>
              <hp>2</hp>
            </hli>
          </hul>
        </editor>
      ) as any
    );

    it('should get block at path', () => {
      const res = input.api.block({ at: [1, 0, 0] });

      expect(res).toEqual([
        { children: [{ text: '2' }], type: 'p' },
        [1, 0, 0],
      ]);
    });
  });

  describe('when above option', () => {
    const input = createEditor(
      (
        <editor>
          <hul>
            <hli>
              <hp>
                1<cursor />
              </hp>
            </hli>
          </hul>
        </editor>
      ) as any
    );

    it('should get block above selection', () => {
      const res = input.api.block({ above: true });

      expect(res).toEqual([
        { children: [{ text: '1' }], type: 'p' },
        [0, 0, 0],
      ]);
    });

    it('should get block above path', () => {
      const res = input.api.block({ above: true, at: [0, 0, 0] });

      expect(res).toEqual([
        { children: [{ children: [{ text: '1' }], type: 'p' }], type: 'li' },
        [0, 0],
      ]);
    });
  });

  describe('when highest option', () => {
    const input = createEditor(
      (
        <editor>
          <hp>first</hp>
          <hul>
            <hli>
              <hp>
                1<cursor />
              </hp>
            </hli>
          </hul>
        </editor>
      ) as any
    );

    it('should get highest block at selection', () => {
      const res = input.api.block({ highest: true });

      expect(res).toEqual([
        <hul>
          <hli>
            <hp>1</hp>
          </hli>
        </hul>,
        [1],
      ]);
    });

    it('should get highest block at path', () => {
      const res = input.api.block({ at: [0, 0, 0], highest: true });

      expect(res).toEqual([<hp>first</hp>, [0]]);
    });
  });

  describe('when no block found', () => {
    const input = createEditor(
      (
        <editor>
          <hp>1</hp>
        </editor>
      ) as any
    );

    it('should return undefined for non-existent path', () => {
      const res = input.api.block({ at: [1] });

      expect(res).toBeUndefined();
    });

    it('should return undefined for non-matching options', () => {
      const res = input.api.block({ match: { type: 'non-existent' } });

      expect(res).toBeUndefined();
    });
  });
});
