import { createTestEditor } from './__tests__/createTestEditor';
import { findTextRangeInBlock } from './findTextRangeInBlock';

describe('findTextRangeInBlock', () => {
  it('should find text in a simple nested inline node', () => {
    const editor = createTestEditor([
      {
        id: '231asasd',
        children: [
          { text: 'a' },
          {
            children: [{ text: 'test' }],
            type: 'a',
            url: '/docs/heading',
          },
        ],
        type: 'p',
      },
    ]);

    const range = findTextRangeInBlock({
      block: editor.api.node([0])!,
      findText: 'test',
    });

    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    });
  });

  it('should find text spanning multiple styled nodes', () => {
    const editor = createTestEditor([
      {
        id: 'gYBjGfssdm',
        children: [
          { text: 'This is a tes1texst' },
          { bold: true, text: 't' },
          { italic: true, text: 'e' },
          { comment: true, text: 's' },
          { kbd: true, text: 't' },
        ],
        type: 'p',
      },
    ]);

    const range = findTextRangeInBlock({
      block: editor.api.node([0])!,
      findText: 'test',
    });

    // "test" 出现在最后 4 个节点里 (t + e + s + t)
    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 1] },
      focus: { offset: 1, path: [0, 4] },
    });
  });

  it('should fallback to prefix when full text not found', () => {
    const editor = createTestEditor([
      {
        id: 'block1',
        children: [{ text: 'This is a tes' }],
        type: 'p',
      },
    ]);

    const range = findTextRangeInBlock({
      block: editor.api.node([0])!,
      findText: 'test',
    });

    // fallback → 匹配 'tes'
    expect(range).toEqual({
      anchor: { offset: 10, path: [0, 0] },
      focus: { offset: 13, path: [0, 0] },
    });
  });

  it('should return null when neither full nor prefix found', () => {
    const editor = createTestEditor([
      {
        id: 'block2',
        children: [{ text: 'abc' }],
        type: 'p',
      },
    ]);

    const range = findTextRangeInBlock({
      block: editor.api.node([0])!,
      findText: 'xyz',
    });

    expect(range).toBeNull();
  });

  it('should correctly match text spanning multiple nodes with minor spacing differences', () => {
    const editor = createTestEditor([
      {
        id: '-WVMecrPDQ',
        children: [
          { text: 'Structure your content with ' },
          { children: [{ text: 'headings' }], type: 'a', url: '/docs/heading' },
          { text: ', ' },
          { children: [{ text: 'lists' }], type: 'a', url: '/docs/list' },
          { text: ', and ' },
          {
            children: [{ text: 'quotes' }],
            type: 'a',
            url: '/docs/blockquote',
          },
          { text: '. Apply ' },
          {
            children: [{ text: 'marks' }],
            type: 'a',
            url: '/docs/basic-marks',
          },
          { text: ' like ' },
          { bold: true, text: 'bold' },
          { text: ', ' },
          { italic: true, text: 'italic' },
          { text: ', ' },
          { text: 'underline', underline: true },
          { text: ', ' },
          { strikethrough: true, text: 'strikethrough' },
          { text: ', and ' },
          { code: true, text: 'code' },
          { text: '. Use ' },
          {
            children: [{ text: 'autoformatting' }],
            type: 'a',
            url: '/docs/autoformat',
          },
          { text: ' for ' },
          {
            children: [{ text: 'Markdown' }],
            type: 'a',
            url: '/docs/markdown',
          },
          { text: '-like shortcuts (e.g., ' },
          { kbd: true, text: '* ' },
          { text: ' for lists, ' },
          { kbd: true, text: '# ' },
          { text: ' for H1).' },
        ],
        type: 'p',
      },
    ]);

    const range = findTextRangeInBlock({
      block: editor.api.node([0])!,
      findText:
        'Structure your content with headings, lists, and quotes. Apply marks like bold, italic, underline, strikethrough, and code. Use autoformatting for Markdown-like shortcuts (e.g., * for lists, # for H1).',
    });

    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 9, path: [0, 26] },
    });
  });

  it('should not match text spanning multiple nodes when there are significant differences', () => {
    const editor = createTestEditor([
      {
        id: '-WVMecrPDQ',
        children: [
          { text: 'Structure your content with ' },
          { children: [{ text: 'headings' }], type: 'a', url: '/docs/heading' },
          { text: ', ' },
          { children: [{ text: 'lists' }], type: 'a', url: '/docs/list' },
          { text: ', and ' },
          {
            children: [{ text: 'quotes' }],
            type: 'a',
            url: '/docs/blockquote',
          },
          { text: '. Apply ' },
          {
            children: [{ text: 'marks' }],
            type: 'a',
            url: '/docs/basic-marks',
          },
          { text: ' like ' },
          { bold: true, text: 'bold' },
          { text: ', ' },
          { italic: true, text: 'italic' },
          { text: ', ' },
          { text: 'underline', underline: true },
          { text: ', ' },
          { strikethrough: true, text: 'strikethrough' },
          { text: ', and ' },
          { code: true, text: 'code' },
          { text: '. Use ' },
          {
            children: [{ text: 'autoformatting' }],
            type: 'a',
            url: '/docs/autoformat',
          },
          { text: ' for ' },
          {
            children: [{ text: 'Markdown' }],
            type: 'a',
            url: '/docs/markdown',
          },
          { text: '-like shortcuts (e.g., ' },
          { kbd: true, text: '* ' },
          { text: ' for lists, ' },
          { kbd: true, text: '# ' },
          { text: ' for H1).' },
        ],
        type: 'p',
      },
    ]);

    const range = findTextRangeInBlock({
      block: editor.api.node([0])!,
      findText:
        'Structure your content with headings, lixxxxxxxxxxxxxsts, and quotes. Apply marks like bold, italic, underline, strikethrough, and code. Use autoformatting for Markdown-like shortcuts (e.g., * for lists, # for H1).',
    });

    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 3, 0] },
    });
  });
});
