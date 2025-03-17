/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('last', () => {
  describe('when no options', () => {
    const input = createEditor(
      (
        <editor>
          <hp>1</hp>
          <hp>2</hp>
        </editor>
      ) as any
    );

    it('should get last node', () => {
      const res = input.api.last([]);

      expect(res).toEqual([{ text: '2' }, [1, 0]]);
    });
  });

  describe('when level option', () => {
    const input = createEditor(
      (
        <editor>
          <hh1>
            <hp>test</hp>
          </hh1>
          <hh1>
            <hp>test2</hp>
          </hh1>
        </editor>
      ) as any
    );

    it('should get last node at level 0', () => {
      const res = input.api.last([], { level: 0 });

      expect(res).toEqual([
        {
          children: [{ children: [{ text: 'test2' }], type: 'p' }],
          type: 'h1',
        },
        [1],
      ]);
    });

    it('should get last node at level 1', () => {
      const res = input.api.last([], { level: 1 });

      expect(res).toEqual([
        { children: [{ text: 'test2' }], type: 'p' },
        [1, 0],
      ]);
    });

    it('should get last node at level 2', () => {
      const res = input.api.last([], { level: 2 });

      expect(res).toEqual([{ text: 'test2' }, [1, 0, 0]]);
    });
  });

  describe('when at option', () => {
    const input = createEditor(
      (
        <editor>
          <hul>
            <hli>
              <hp>2</hp>
            </hli>
            <hli>
              <hp>3</hp>
            </hli>
          </hul>
          <hp>1</hp>
        </editor>
      ) as any
    );

    it('should get last node at path', () => {
      const res = input.api.last([0], { level: 1 });

      expect(res).toEqual([
        { children: [{ children: [{ text: '3' }], type: 'p' }], type: 'li' },
        [0, 1],
      ]);
    });
  });

  describe('when node not found', () => {
    const input = createEditor(
      (
        <editor>
          <hp>1</hp>
        </editor>
      ) as any
    );

    it('should return undefined for non-existent path', () => {
      const res = input.api.last([1]);

      expect(res).toBeUndefined();
    });
  });

  describe('when editor has no children', () => {
    const input = createEditor((<editor></editor>) as any);

    it('should return undefined when level is 0', () => {
      const res = input.api.last([], { level: 0 });

      expect(res).toBeUndefined();
    });
  });

  describe('when element has no children', () => {
    const input = createEditor(
      (
        <editor>
          <element></element>
        </editor>
      ) as any
    );

    it('should return undefined when getting last node in empty element', () => {
      const res = input.api.last([1]);

      expect(res).toBeUndefined();
    });
  });
});
