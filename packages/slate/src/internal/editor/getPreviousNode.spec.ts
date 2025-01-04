import { createTEditor } from '../createTEditor';

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
