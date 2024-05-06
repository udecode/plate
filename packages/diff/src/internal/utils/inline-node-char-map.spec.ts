import { InlineNodeCharMap } from './inline-node-char-map';

describe('InlineNodeCharMap', () => {
  let map: InlineNodeCharMap;

  beforeEach(() => {
    const charGenerator: Generator<string> = (function* () {
      yield* 'HI';
    })();

    map = new InlineNodeCharMap({ charGenerator });
  });

  describe('nodeToText', () => {
    it('should replace inline nodes with generated chars', () => {
      const inline1 = { children: [{ text: '' }], type: 'inline1' };
      const inline2 = { children: [{ text: '' }], type: 'inline2' };
      const text1 = map.nodeToText(inline1);
      const text2 = map.nodeToText(inline2);
      expect(text1.text).toBe('H');
      expect(text2.text).toBe('I');
    });
  });

  describe('round trip', () => {
    it('should convert inline nodes to text and back', () => {
      const inline1 = { children: [{ text: '' }], type: 'inline1' };
      const inline2 = { children: [{ text: '' }], type: 'inline2' };

      const text1 = map.nodeToText(inline1);
      const text2 = map.nodeToText(inline2);

      const input = { bold: true, text: `ABCD${text2.text}EFG${text1.text}` };

      const expected = [
        { bold: true, text: 'ABCD' },
        { ...inline2, bold: true },
        { bold: true, text: 'EFG' },
        { ...inline1, bold: true },
      ];

      const output = map.textToNode(input);
      expect(output).toEqual(expected);
    });
  });
});
