import type { TText } from 'platejs';

import { createTestEditor } from '../__tests__/createTestEditor';
import { defaultRules } from '../rules';
import { convertTextsSerialize } from './convertTextsSerialize';

describe('convertTextsSerialize', () => {
  const editor = createTestEditor();
  const options = {
    editor,
    rules: defaultRules,
  } as const;

  it('keeps outer whitespace outside a single closing mark', () => {
    const result = convertTextsSerialize(
      [{ bold: true, text: ' padded ' }] as TText[],
      options
    );

    expect(result).toEqual([
      { type: 'text', value: ' ' },
      {
        children: [{ type: 'text', value: 'padded' }],
        type: 'strong',
      },
      { type: 'text', value: ' ' },
    ]);
  });

  it('nests inline code inside other marks instead of wrapping the mark itself', () => {
    const result = convertTextsSerialize(
      [{ bold: true, code: true, text: 'x' }] as TText[],
      options
    );

    expect(result).toEqual([
      {
        children: [{ type: 'inlineCode', value: 'x' }],
        type: 'strong',
      },
    ]);
  });

  it('flattens empty formatted output back to an empty text node', () => {
    const result = convertTextsSerialize(
      [{ bold: true, text: '' }] as TText[],
      options
    );

    expect(result).toEqual([{ type: 'text', value: '' }]);
  });
});
