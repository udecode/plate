import { createTEditor } from '@udecode/slate';

import { getPreviousBlockById } from './getPreviousBlockById';

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
