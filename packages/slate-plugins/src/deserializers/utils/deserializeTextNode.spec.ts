import { deserializeTextNode } from 'deserializers/utils/deserializeTextNode';

describe('when deserializeTextNode', () => {
  describe('when ', () => {
    it('should be the text content of the node', () => {
      expect(deserializeTextNode(document.createTextNode('test'))).toBe('test');
    });
  });

  describe('when not a text node', () => {
    it('should be undefined', () => {
      expect(
        deserializeTextNode(document.createElement('div'))
      ).toBeUndefined();
    });
  });
});
