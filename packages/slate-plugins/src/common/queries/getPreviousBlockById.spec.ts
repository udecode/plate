import { createEditor } from 'slate';
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

describe('when getPreviousNodeById', () => {
  describe('when not first block', () => {
    it('should be ', () => {
      const e = createEditor();
      e.children = nodesFixture5;
      expect(getPreviousBlockById(e, '3')?.[0]).toEqual(nodesFixture5[1]);
    });
  });

  describe('when first block', () => {
    it('should be ', () => {
      const e = createEditor();
      e.children = nodesFixture5;
      expect(getPreviousBlockById(e, '1')).toEqual([null, [-1]]);
    });
  });

  describe('when not found', () => {
    it('should be undefined', () => {
      const e = createEditor();
      e.children = nodesFixture5;
      expect(getPreviousBlockById(e, '11')?.[0]).toBeUndefined();
    });
  });
});
