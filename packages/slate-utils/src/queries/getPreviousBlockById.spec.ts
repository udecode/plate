import { createTEditor } from '@udecode/slate';

import { getPreviousBlockById } from './getPreviousBlockById';

const nodesFixture5 = [
  {
    children: [{ text: '' }],
    id: '1',
    type: 'p',
  },
  {
    children: [{ text: '' }],
    id: '2',
    type: 'p',
  },
  {
    children: [{ text: '' }],
    id: '3',
    type: 'p',
  },
];

const nodesFixtureWithList = [
  {
    children: [{ text: '' }],
    id: '1',
    type: 'p',
  },
  {
    children: [
      {
        children: [{ children: [{ text: 'hi' }], id: '211', type: 'p' }],
        id: '21',
        type: 'li',
      },
      {
        children: [{ children: [{ text: 'hi' }], id: '221', type: 'p' }],
        id: '22',
        type: 'li',
      },
      {
        children: [{ children: [{ text: 'hi' }], id: '231', type: 'p' }],
        id: '23',
        type: 'li',
      },
    ],
    id: '2',
    type: 'ul',
  },
  {
    children: [{ text: '' }],
    id: '3',
    type: 'p',
  },
];

describe('when getPreviousNodeById', () => {
  describe('when not first block', () => {
    it('should be', () => {
      const e = createTEditor();
      e.children = nodesFixture5;
      expect(getPreviousBlockById(e, '3')?.[0]).toEqual(nodesFixture5[1]);
    });
  });

  describe('when first block', () => {
    it('should be', () => {
      const e = createTEditor();
      e.children = nodesFixture5;
      expect(getPreviousBlockById(e, '1')).toEqual([null, [-1]]);
    });
  });

  describe('when not found', () => {
    it('should be undefined', () => {
      const e = createTEditor();
      e.children = nodesFixture5;
      expect(getPreviousBlockById(e, '11')?.[0]).toBeUndefined();
    });
  });

  describe('when list', () => {
    it('should return previous block', () => {
      const e = createTEditor();
      e.children = nodesFixtureWithList;
      expect(getPreviousBlockById(e, '2')?.[0]).toEqual(
        nodesFixtureWithList[0]
      );
    });
  });
});
