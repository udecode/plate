import { createSlateEditor, createSlatePlugin } from '../../../index';
import { parseHtmlElement } from './parseHtmlElement';
import { htmlElementToLeaf } from './htmlElementToLeaf';

describe('htmlElementToLeaf', () => {
  it('merges outer leaf marks into descendant text nodes and preserves nested leaf marks', () => {
    const ParagraphPlugin = createSlatePlugin({
      key: 'p',
      node: { isElement: true, type: 'p' },
      parsers: {
        html: {
          deserializer: {
            rules: [{ validNodeName: 'P' }],
          },
        },
      },
    });
    const BoldPlugin = createSlatePlugin({
      key: 'bold',
      node: { isLeaf: true },
      parsers: {
        html: {
          deserializer: {
            rules: [{ validNodeName: 'STRONG' }],
          },
        },
      },
    });
    const ItalicPlugin = createSlatePlugin({
      key: 'italic',
      node: { isLeaf: true },
      parsers: {
        html: {
          deserializer: {
            rules: [{ validNodeName: 'EM' }],
          },
        },
      },
    });
    const editor = createSlateEditor({
      plugins: [ParagraphPlugin, BoldPlugin, ItalicPlugin],
    });

    expect(
      htmlElementToLeaf(
        editor,
        parseHtmlElement('<strong><p>para</p><em>inline</em></strong>')
      )
    ).toEqual([
      {
        children: [{ bold: true, text: 'para' }],
        type: 'p',
      },
      {
        bold: true,
        italic: true,
        text: 'inline',
      },
    ]);
  });
});
