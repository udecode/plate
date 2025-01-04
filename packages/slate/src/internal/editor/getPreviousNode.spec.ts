import { createTEditor } from '../../createTEditor';

const nodesFixture5 = [
  {
    id: '1',
    children: [{ text: '' }],
    type: 'p',
  },
  {
    id: '2',
    children: [{ text: '' }],
    type: 'p',
  },
  {
    id: '3',
    children: [{ text: '' }],
    type: 'p',
  },
];

const nodesFixtureWithList = [
  {
    id: '1',
    children: [{ text: '' }],
    type: 'p',
  },
  {
    id: '2',
    children: [
      {
        id: '21',
        children: [{ id: '211', children: [{ text: 'hi' }], type: 'p' }],
        type: 'li',
      },
      {
        id: '22',
        children: [{ id: '221', children: [{ text: 'hi' }], type: 'p' }],
        type: 'li',
      },
      {
        id: '23',
        children: [{ id: '231', children: [{ text: 'hi' }], type: 'p' }],
        type: 'li',
      },
    ],
    type: 'ul',
  },
  {
    id: '3',
    children: [{ text: '' }],
    type: 'p',
  },
];

describe('when getting previous node by id', () => {
  describe('when not first block', () => {
    it('should return the previous block', () => {
      const e = createTEditor();
      e.children = nodesFixture5;
      expect(e.api.previous({ id: '3', block: true })?.[0]).toEqual(
        nodesFixture5[1]
      );
    });
  });

  describe('when first block', () => {
    it('should return [null, [-1]]', () => {
      const e = createTEditor();
      e.children = nodesFixture5;
      expect(e.api.previous({ id: '1', block: true })).toEqual([null, [-1]]);
    });
  });

  describe('when not found', () => {
    it('should return undefined', () => {
      const e = createTEditor();
      e.children = nodesFixture5;
      expect(e.api.previous({ id: '11', block: true })?.[0]).toBeUndefined();
    });
  });

  describe('when list', () => {
    it('should return previous block', () => {
      const e = createTEditor();
      e.children = nodesFixtureWithList;
      expect(e.api.previous({ id: '2', block: true })?.[0]).toEqual(
        nodesFixtureWithList[0]
      );
    });
  });
});

describe('sibling', () => {
  const nodesFixture = [
    {
      id: '1',
      children: [{ text: 'first' }],
      type: 'p',
    },
    {
      id: '2',
      children: [{ text: 'second' }],
      type: 'p',
    },
    {
      id: '3',
      children: [{ text: 'third' }],
      type: 'p',
    },
  ];

  const nestedNodesFixture = [
    {
      id: 'parent',
      children: [
        {
          id: 'child1',
          children: [{ text: 'first child' }],
          type: 'p',
        },
        {
          id: 'child2',
          children: [{ text: 'second child' }],
          type: 'p',
        },
      ],
      type: 'div',
    },
  ];

  describe('when getting previous sibling node', () => {
    describe('when has previous sibling', () => {
      it('should return the previous sibling', () => {
        const editor = createTEditor();
        editor.children = nodesFixture;

        const result = editor.api.previous({ at: [1], sibling: true });

        expect(result?.[0]).toEqual(nodesFixture[0]);
        expect(result?.[1]).toEqual([0]);
      });
    });

    describe('when is first child', () => {
      it('should return undefined', () => {
        const editor = createTEditor();
        editor.children = nodesFixture;

        const result = editor.api.previous({ at: [0], sibling: true });

        expect(result).toBeUndefined();
      });
    });

    describe('when nested nodes', () => {
      it('should return previous sibling at correct level', () => {
        const editor = createTEditor();
        editor.children = nestedNodesFixture;

        const result = editor.api.previous({ at: [0, 1], sibling: true });

        expect(result?.[0]).toEqual(nestedNodesFixture[0].children[0]);
        expect(result?.[1]).toEqual([0, 0]);
      });
    });

    describe('when path is invalid', () => {
      it('should return undefined', () => {
        const editor = createTEditor();
        editor.children = nodesFixture;

        const result = editor.api.previous({ at: undefined, sibling: true });

        expect(result).toBeUndefined();
      });
    });
  });
});
