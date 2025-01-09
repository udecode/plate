/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('when getting node by location', () => {
  const input = createEditor(
    (
      <editor>
        <hp>
          1
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  it('should get node at path', () => {
    const res = input.api.node([0]);

    expect(res).toEqual([{ children: [{ text: '1' }], type: 'p' }, [0]]);
  });
});

describe('when finding node by options', () => {
  const input = createEditor(
    (
      <editor>
        <hul>
          <hli>
            <hp>
              1
              <cursor />
            </hp>
          </hli>
        </hul>
      </editor>
    ) as any
  );

  it('should find first paragraph', () => {
    const res = input.api.node({ match: { type: 'p' } });
    input.api.node({});

    expect(res).toEqual([{ children: [{ text: '1' }], type: 'p' }, [0, 0, 0]]);
  });

  it('should find first paragraph at specific path', () => {
    const res = input.api.node({ at: [0, 0], match: { type: 'p' } });

    expect(res).toEqual([{ children: [{ text: '1' }], type: 'p' }, [0, 0, 0]]);
  });

  it('should find first list', () => {
    const res = input.api.node({ match: { type: 'ul' } });

    expect(res![0]).toEqual({
      children: [
        {
          children: [{ children: [{ text: '1' }], type: 'p' }],
          type: 'li',
        },
      ],
      type: 'ul',
    });
    expect(res![1]).toEqual([0]);
  });
});

describe('when node is not found', () => {
  const input = createEditor(
    (
      <editor>
        <hp>
          1
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  it('should return undefined for non-existent path', () => {
    const res = input.api.node([1]);

    expect(res).toBeUndefined();
  });

  it('should return undefined for non-matching options', () => {
    const res = input.api.node({ match: { type: 'non-existent' } });

    expect(res).toBeUndefined();
  });
});
