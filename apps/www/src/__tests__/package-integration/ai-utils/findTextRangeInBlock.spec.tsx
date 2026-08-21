import { BaseAIPlugin } from '@platejs/ai';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { BaseCommentPlugin } from '@platejs/comment';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseParagraphPlugin, createBaseEditor, type Value } from 'platejs';

const plugins = [
  BaseParagraphPlugin,
  BaseLinkPlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseCommentPlugin,
  BaseKbdPlugin,
  BaseAIPlugin,
];

const createTestEditor = (value: Value) =>
  createBaseEditor({
    plugins,
    initialValue: value,
  });

const getFirstBlock = (editor: ReturnType<typeof createTestEditor>) =>
  editor.read.nodes.get([0])!;

describe('findTextRangeInBlock', () => {
  it('find text in a simple nested inline node', () => {
    const editor = createTestEditor([
      {
        children: [
          { text: 'a' },
          {
            children: [{ text: 'test' }],
            type: 'link',
            url: '/docs/heading',
          },
        ],
        type: 'paragraph',
      },
    ]);

    const range = editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
      block: getFirstBlock(editor),
      findText: 'test',
    });

    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    });
  });

  it('find text spanning multiple styled nodes', () => {
    const editor = createTestEditor([
      {
        children: [
          { text: 'This is a tes1texst' },
          { bold: true, text: 't' },
          { italic: true, text: 'e' },
          { comment: true, text: 's' },
          { kbd: true, text: 't' },
        ],
        type: 'paragraph',
      },
    ]);

    const range = editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
      block: getFirstBlock(editor),
      findText: 'test',
    });

    // "test" 出现在最后 4 个节点里 (t + e + s + t)
    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 1] },
      focus: { offset: 1, path: [0, 4] },
    });
  });

  it('fallback to prefix when full text not found', () => {
    const editor = createTestEditor([
      {
        children: [{ text: 'This is a tes' }],
        type: 'paragraph',
      },
    ]);

    const range = editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
      block: getFirstBlock(editor),
      findText: 'test',
    });

    // fallback → 匹配 'tes'
    expect(range).toEqual({
      anchor: { offset: 10, path: [0, 0] },
      focus: { offset: 13, path: [0, 0] },
    });
  });

  it('returns null when neither full nor prefix found', () => {
    const editor = createTestEditor([
      {
        children: [{ text: 'abc' }],
        type: 'paragraph',
      },
    ]);

    const range = editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
      block: getFirstBlock(editor),
      findText: 'xyz',
    });

    expect(range).toBeNull();
  });

  it('correctly match text spanning multiple nodes with minor spacing differences', () => {
    const editor = createTestEditor([
      {
        children: [
          { text: 'Structure your content with ' },
          {
            children: [{ text: 'headings' }],
            type: 'link',
            url: '/docs/heading',
          },
          { text: ', ' },
          { children: [{ text: 'lists' }], type: 'link', url: '/docs/list' },
          { text: ', and ' },
          {
            children: [{ text: 'quotes' }],
            type: 'link',
            url: '/docs/blockquote',
          },
          { text: '. Apply ' },
          {
            children: [{ text: 'marks' }],
            type: 'link',
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
            type: 'link',
            url: '/docs/autoformat',
          },
          { text: ' for ' },
          {
            children: [{ text: 'Markdown' }],
            type: 'link',
            url: '/docs/markdown',
          },
          { text: '-like shortcuts (e.g., ' },
          { kbd: true, text: '* ' },
          { text: ' for lists, ' },
          { kbd: true, text: '# ' },
          { text: ' for H1).' },
        ],
        type: 'paragraph',
      },
    ]);

    const range = editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
      block: getFirstBlock(editor),
      findText:
        'Structure your content with headings, lists, and quotes. Apply marks like bold, italic, underline, strikethrough, and code. Use autoformatting for Markdown-like shortcuts (e.g., * for lists, # for H1).',
    });

    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 9, path: [0, 26] },
    });
  });

  it('does not match text spanning multiple nodes when there are significant differences', () => {
    const editor = createTestEditor([
      {
        children: [
          { text: 'Structure your content with ' },
          {
            children: [{ text: 'headings' }],
            type: 'link',
            url: '/docs/heading',
          },
          { text: ', ' },
          { children: [{ text: 'lists' }], type: 'link', url: '/docs/list' },
          { text: ', and ' },
          {
            children: [{ text: 'quotes' }],
            type: 'link',
            url: '/docs/blockquote',
          },
          { text: '. Apply ' },
          {
            children: [{ text: 'marks' }],
            type: 'link',
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
            type: 'link',
            url: '/docs/autoformat',
          },
          { text: ' for ' },
          {
            children: [{ text: 'Markdown' }],
            type: 'link',
            url: '/docs/markdown',
          },
          { text: '-like shortcuts (e.g., ' },
          { kbd: true, text: '* ' },
          { text: ' for lists, ' },
          { kbd: true, text: '# ' },
          { text: ' for H1).' },
        ],
        type: 'paragraph',
      },
    ]);

    const range = editor.plugin(BaseAIPlugin).api.findTextRangeInBlock({
      block: getFirstBlock(editor),
      findText:
        'Structure your content with headings, lixxxxxxxxxxxxxsts, and quotes. Apply marks like bold, italic, underline, strikethrough, and code. Use autoformatting for Markdown-like shortcuts (e.g., * for lists, # for H1).',
    });

    expect(range).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 3, 0] },
    });
  });
});
