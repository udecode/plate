import type { TColumnGroupElement } from 'platejs';

import { resizeColumn } from './resizeColumn';

describe('resizeColumn', () => {
  it('distribute widths evenly when every width is missing', () => {
    const columnGroup = {
      children: [
        { children: [], id: 'a', type: 'column' },
        { children: [], id: 'b', type: 'column' },
      ],
      type: 'column_group',
    } as any as TColumnGroupElement;

    resizeColumn(columnGroup, 'a', 70);

    expect(columnGroup.children[0].width).toBe('50%');
    expect(columnGroup.children[1].width).toBe('50%');
  });

  it('leave the group unchanged when the target column does not exist', () => {
    const columnGroup = {
      children: [
        { children: [], id: 'a', type: 'column', width: '40%' },
        { children: [], id: 'b', type: 'column', width: '60%' },
      ],
      type: 'column_group',
    } as any as TColumnGroupElement;

    resizeColumn(columnGroup, 'missing', 70);

    expect(columnGroup.children[0].width).toBe('40%');
    expect(columnGroup.children[1].width).toBe('60%');
  });

  it('adjust the next sibling to keep the group at one hundred percent', () => {
    const columnGroup = {
      children: [
        { children: [], id: 'a', type: 'column', width: '40%' },
        { children: [], id: 'b', type: 'column', width: '30%' },
        { children: [], id: 'c', type: 'column', width: '30%' },
      ],
      type: 'column_group',
    } as any as TColumnGroupElement;

    resizeColumn(columnGroup, 'a', 50);

    expect(columnGroup.children.map((col) => col.width)).toEqual([
      '50%',
      '20%',
      '30%',
    ]);
  });

  it('scale widths back to one hundred percent when sibling clamping is not enough', () => {
    const columnGroup = {
      children: [
        { children: [], id: 'a', type: 'column', width: '40%' },
        { children: [], id: 'b', type: 'column', width: '30%' },
        { children: [], id: 'c', type: 'column', width: '30%' },
      ],
      type: 'column_group',
    } as any as TColumnGroupElement;

    resizeColumn(columnGroup, 'a', 200);

    expect(columnGroup.children.map((col) => col.width)).toEqual([
      '86.96%',
      '0%',
      '13.04%',
    ]);
  });
});
