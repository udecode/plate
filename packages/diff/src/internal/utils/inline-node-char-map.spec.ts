import { InlineNodeCharMap } from './inline-node-char-map';

describe('InlineNodeCharMap', () => {
  let map: InlineNodeCharMap;

  beforeEach(() => {
    map = new InlineNodeCharMap({ unavailableChars: 'ABCDEFG' });
  });

  describe('nodeToText', () => {
    it('should replace inline nodes with unused chars', () => {
      const inline1 = { type: 'inline1', children: [{ text: '' }] };
      const inline2 = { type: 'inline2', children: [{ text: '' }] };
      const text1 = map.nodeToText(inline1);
      const text2 = map.nodeToText(inline2);
      expect(text1.text).toBe('H');
      expect(text2.text).toBe('I');
    });
  });

  describe('round trip', () => {
    it('should convert inline nodes to text and back', () => {
      const inline1 = { type: 'inline1', children: [{ text: '' }] };
      const inline2 = { type: 'inline2', children: [{ text: '' }] };

      const text1 = map.nodeToText(inline1);
      const text2 = map.nodeToText(inline2);

      const input = { text: `ABCD${text2.text}EFG${text1.text}`, bold: true };

      const expected = [
        { text: 'ABCD', bold: true },
        { ...inline2, bold: true },
        { text: 'EFG', bold: true },
        { ...inline1, bold: true },
      ];

      const output = map.textToNode(input);
      expect(output).toEqual(expected);
    });
  });
});
