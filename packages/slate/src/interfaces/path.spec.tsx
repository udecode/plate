import { PathApi } from './path';

const moveNodeCases: {
  expected: number[] | null;
  op: { newPath: number[]; path: number[]; type: 'move_node' };
  path: number[];
}[] = [
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [4], newPath: [3] },
    expected: [4, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [4], newPath: [2] },
    expected: [4, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [2], newPath: [3] },
    expected: [2, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [2], newPath: [4] },
    expected: [2, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3], newPath: [5, 1] },
    expected: [4, 1, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3], newPath: [2, 5] },
    expected: [2, 5, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3, 4], newPath: [3, 0, 0] },
    expected: [3, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3, 2], newPath: [3, 0, 0] },
    expected: [3, 2, 3],
  },
  {
    path: [3, 3],
    op: { type: 'move_node', path: [3, 3], newPath: [3, 5, 0] },
    expected: [3, 4, 0],
  },
  {
    path: [3, 3],
    op: { type: 'move_node', path: [3, 3], newPath: [3, 1, 0] },
    expected: [3, 1, 0],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3, 0, 0], newPath: [3, 4] },
    expected: [3, 3, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3, 0, 0], newPath: [3, 2] },
    expected: [3, 4, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3, 3], newPath: [5, 1] },
    expected: [5, 1, 3],
  },
  {
    path: [3, 3, 3],
    op: { type: 'move_node', path: [3, 3], newPath: [2, 1] },
    expected: [2, 1, 3],
  },
  {
    path: [0, 1],
    op: { type: 'move_node', path: [0, 3], newPath: [0, 1] },
    expected: [0, 2],
  },
  {
    path: [0, 1],
    op: { type: 'move_node', path: [0, 3], newPath: [0, 0] },
    expected: [0, 2],
  },
  {
    path: [0, 1],
    op: { type: 'move_node', path: [0, 0], newPath: [0, 1] },
    expected: [0, 0],
  },
  {
    path: [0, 1],
    op: { type: 'move_node', path: [0, 0], newPath: [0, 3] },
    expected: [0, 0],
  },
];

describe('PathApi', () => {
  describe('helpers', () => {
    it('builds child paths', () => {
      expect(PathApi.child([0], 2)).toEqual([0, 2]);
      expect(PathApi.firstChild([1, 4])).toEqual([1, 4, 0]);
      expect(PathApi.lastIndex([1, 4])).toBe(4);
      expect(PathApi.lastIndex([])).toBe(-1);
    });

    it('keeps next and parent safe at the root', () => {
      expect(PathApi.next([])).toEqual([]);
      expect(PathApi.parent([])).toEqual([]);
    });

    it('handles previous safely for root and first siblings', () => {
      expect(PathApi.previous([])).toBeUndefined();
      expect(PathApi.previous([0, 0])).toBeUndefined();
      expect(PathApi.previous([0, 2])).toEqual([0, 1]);
    });
  });

  describe('predicates and comparisons', () => {
    const compareCases: Array<{
      another: number[];
      expected: -1 | 0 | 1;
      path: number[];
    }> = [
      { path: [0, 1, 2], another: [0], expected: 0 },
      { path: [1, 1, 2], another: [0], expected: 1 },
      { path: [0, 1, 2], another: [1], expected: -1 },
      { path: [0], another: [0, 1], expected: 0 },
      { path: [0, 1, 2], another: [0, 1, 2], expected: 0 },
      { path: [0, 1, 2], another: [], expected: 0 },
    ];

    it.each([
      { input: true, expected: false },
      { input: [], expected: true },
      { input: [0, 1], expected: true },
      { input: [2, 4, 'b'], expected: false },
      { input: ['a', 'b'], expected: false },
    ])('checks isPath for $input', ({ input, expected }) => {
      expect(PathApi.isPath(input)).toBe(expected);
    });

    it.each(compareCases)('compares $path with $another', ({
      path,
      another,
      expected,
    }) => {
      expect(PathApi.compare(path, another)).toBe(expected);
    });

    it('covers equality and family relationships', () => {
      expect(PathApi.equals([0, 1], [0, 1])).toBe(true);
      expect(PathApi.equals([0, 1], [0, 2])).toBe(false);
      expect(PathApi.common([0, 1, 2], [0, 2])).toEqual([0]);
      expect(PathApi.common([0, 1, 2], [3, 2])).toEqual([]);
      expect(PathApi.relative([0, 1, 2], [0])).toEqual([1, 2]);
      expect(PathApi.relative([0, 1], [])).toEqual([0, 1]);
      expect(PathApi.hasPrevious([0, 0])).toBe(false);
      expect(PathApi.hasPrevious([0, 1])).toBe(true);
      expect(PathApi.isAncestor([0], [0, 1])).toBe(true);
      expect(PathApi.isDescendant([0, 1], [0])).toBe(true);
      expect(PathApi.isParent([0], [0, 1])).toBe(true);
      expect(PathApi.isChild([0, 1], [0])).toBe(true);
      expect(PathApi.isSibling([0, 1], [0, 2])).toBe(true);
      expect(PathApi.endsAfter([0, 2], [0, 1])).toBe(true);
      expect(PathApi.endsAt([0, 1], [0, 1])).toBe(true);
      expect(PathApi.endsBefore([0, 0], [0, 1])).toBe(true);
      expect(PathApi.isAfter([0, 2], [0, 1])).toBe(true);
      expect(PathApi.isBefore([0, 0], [0, 1])).toBe(true);
    });
  });

  describe('ancestor and level traversal', () => {
    it('returns ancestors in both directions', () => {
      expect(PathApi.ancestors([0, 1, 2])).toEqual([[], [0], [0, 1]]);
      expect(PathApi.ancestors([0, 1, 2], { reverse: true })).toEqual([
        [0, 1],
        [0],
        [],
      ]);
    });

    it('returns levels in both directions', () => {
      expect(PathApi.levels([0, 1, 2])).toEqual([[], [0], [0, 1], [0, 1, 2]]);
      expect(PathApi.levels([0, 1, 2], { reverse: true })).toEqual([
        [0, 1, 2],
        [0, 1],
        [0],
        [],
      ]);
    });
  });

  describe('move_node transforms', () => {
    it.each(moveNodeCases)('transforms $path with $op', ({
      expected,
      op,
      path,
    }) => {
      expect(PathApi.transform(path, op)).toEqual(expected);
    });
  });
});
