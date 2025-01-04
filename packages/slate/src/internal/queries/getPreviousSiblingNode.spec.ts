import { createTEditor } from '../createTEditor';

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
