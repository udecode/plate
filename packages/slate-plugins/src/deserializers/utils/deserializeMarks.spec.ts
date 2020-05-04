import {
  addAttrsToChildren,
  deserializeMarks,
} from 'deserializers/utils/deserializeMarks';
import { ParagraphPlugin } from 'elements/paragraph';
import { BoldPlugin } from 'marks/bold';
import { Node } from 'slate';

const node: Node = {
  type: 'li',
  children: [
    {
      type: 'p',
      children: [{ text: 'test' }],
    },
    { text: 'test' },
  ],
};

describe('when deserializeMarks', () => {
  describe('when children has an Element', () => {
    it('should add the marks to all the Text nodes', () => {
      expect(
        deserializeMarks({
          plugins: [ParagraphPlugin(), BoldPlugin()],
          el: document.createElement('strong'),
          children: [node],
        })
      ).toEqual([
        {
          type: 'li',
          children: [
            {
              type: 'p',
              children: [{ text: 'test', bold: true }],
            },
            { text: 'test', bold: true },
          ],
        },
      ]);
    });
  });

  describe('when children is a Text', () => {
    it('should add the marks to the node', () => {
      expect(
        deserializeMarks({
          plugins: [BoldPlugin()],
          el: document.createElement('strong'),
          children: [{ text: 'test' }],
        })
      ).toEqual([{ text: 'test', bold: true }]);
    });
  });
});

describe('when addAttrsToChildren', () => {
  it('should deeply add attrs to all child with text property', () => {
    const attrs = {
      bold: true,
    };

    addAttrsToChildren(node, attrs);

    expect(node).toEqual({
      type: 'li',
      children: [
        {
          type: 'p',
          children: [{ text: 'test', ...attrs }],
        },
        { text: 'test', ...attrs },
      ],
    });
  });
});
