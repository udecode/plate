import { createTestEditor } from '../../__tests__/createTestEditor';
import { deserializeInlineMd } from './deserializeInlineMd';

describe('deserializeInlineMd', () => {
  it('keeps leading and trailing spaces around parsed inline markdown', () => {
    const editor = createTestEditor();

    expect(deserializeInlineMd(editor, '  **bold**  ')).toEqual([
      { text: '  ' },
      { bold: true, text: 'bold' },
      { text: '  ' },
    ]);
  });

  it('returns only surrounding spaces when inline markdown produces no node', () => {
    const editor = createTestEditor();

    expect(deserializeInlineMd(editor, '   ')).toEqual([{ text: '   ' }]);
  });
});
