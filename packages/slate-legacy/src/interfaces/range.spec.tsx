import { RangeApi, type TRange } from './range';

const range: TRange = {
  anchor: { offset: 0, path: [1] },
  focus: { offset: 0, path: [3] },
};

describe('RangeApi', () => {
  const includeCases: Array<{
    expected: boolean;
    range?: TRange;
    target: any;
  }> = [
    { target: [4], expected: false },
    { target: [0], expected: false },
    { target: [3], expected: true },
    { target: [2], expected: true },
    { target: [1], expected: true },
    { target: { path: [2], offset: 0 }, expected: true },
    { target: { path: [1], offset: 0 }, expected: true },
    {
      target: { path: [1], offset: 0 },
      expected: false,
      range: {
        anchor: { path: [1], offset: 3 },
        focus: { path: [3], offset: 0 },
      },
    },
    { target: { path: [4], offset: 0 }, expected: false },
    { target: { path: [0], offset: 0 }, expected: false },
  ];

  it('checks containment for nested ranges', () => {
    expect(
      RangeApi.contains(
        {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        }
      )
    ).toBe(true);
  });

  it.each(includeCases)('includes $target', ({
    target,
    expected,
    range: customRange,
  }) => {
    expect(RangeApi.includes(customRange ?? range, target as any)).toBe(
      expected
    );
  });

  it('checks equality', () => {
    expect(
      RangeApi.equals(
        {
          anchor: { path: [0, 1], offset: 0 },
          focus: { path: [0, 1], offset: 0 },
        },
        {
          anchor: { path: [0, 1], offset: 0 },
          focus: { path: [0, 1], offset: 0 },
        }
      )
    ).toBe(true);

    expect(
      RangeApi.equals(
        {
          anchor: { path: [0, 4], offset: 7 },
          focus: { path: [0, 4], offset: 7 },
        },
        {
          anchor: { path: [0, 1], offset: 0 },
          focus: { path: [0, 1], offset: 0 },
        }
      )
    ).toBe(false);
  });

  it('returns ordered edges and point entries', () => {
    const collapsed = {
      anchor: { path: [0], offset: 0 },
      focus: { path: [0], offset: 0 },
    };

    expect(RangeApi.edges(collapsed)).toEqual([
      { path: [0], offset: 0 },
      { path: [0], offset: 0 },
    ]);
    expect(Array.from(RangeApi.points(collapsed))).toEqual([
      [collapsed.anchor, 'anchor'],
      [collapsed.focus, 'focus'],
    ]);
  });

  it('handles collapsed and expanded states, including nullish input', () => {
    const collapsed = {
      anchor: { path: [0], offset: 0 },
      focus: { path: [0], offset: 0 },
    };
    const expanded = {
      anchor: { path: [0], offset: 0 },
      focus: { path: [3], offset: 0 },
    };

    expect(RangeApi.isCollapsed(collapsed)).toBe(true);
    expect(RangeApi.isCollapsed(expanded)).toBe(false);
    expect(RangeApi.isCollapsed(null)).toBe(false);
    expect(RangeApi.isExpanded(collapsed)).toBe(false);
    expect(RangeApi.isExpanded(expanded)).toBe(true);
    expect(RangeApi.isExpanded(undefined)).toBe(false);
  });

  it('reports forward and backward ranges', () => {
    expect(
      RangeApi.isForward({
        anchor: { path: [0], offset: 0 },
        focus: { path: [0], offset: 2 },
      })
    ).toBe(true);
    expect(
      RangeApi.isBackward({
        anchor: { path: [0], offset: 2 },
        focus: { path: [0], offset: 0 },
      })
    ).toBe(true);
  });

  it('transforms ranges with inward and outward affinity', () => {
    expect(
      RangeApi.transform(
        {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        {
          type: 'split_node',
          path: [0, 0],
          position: 1,
          properties: {},
        },
        { affinity: 'inward' }
      )
    ).toEqual({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    });

    expect(
      RangeApi.transform(
        {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        {
          type: 'insert_text',
          path: [0, 0],
          text: 'a',
          offset: 1,
          properties: {},
        },
        { affinity: 'outward' }
      )
    ).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });
  });
});
