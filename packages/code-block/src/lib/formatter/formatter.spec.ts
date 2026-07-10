import type { TCodeBlockElement } from '@platejs/utils';

import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { formatCodeBlock, isLangSupported, isValidSyntax } from './formatter';

const createFormatterEditor = (code: string, lang: string) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
    value: [
      {
        children: [{ children: [{ text: code }], type: 'code_line' }],
        lang,
        type: 'code_block',
      },
    ],
  });

describe('formatter', () => {
  it('only supports json formatting', () => {
    expect(isLangSupported('json')).toBe(true);
    expect(isLangSupported('javascript')).toBe(false);
    expect(isLangSupported(undefined)).toBe(false);
  });

  it('validates syntax only for supported languages', () => {
    expect(isValidSyntax('{"name":"plate"}', 'json')).toBe(true);
    expect(isValidSyntax('{name:"plate"}', 'json')).toBe(false);
    expect(isValidSyntax('const a = 1;', 'javascript')).toBe(false);
  });

  it('does nothing when the block language is unsupported', () => {
    const editor = createFormatterEditor('{"name":"plate"}', 'javascript');
    const before = editor.read.children();
    const element = before[0] as TCodeBlockElement;

    formatCodeBlock(editor, { element });

    expect(editor.read.children()).toEqual(before);
  });

  it('does nothing when the code is invalid for the language', () => {
    const editor = createFormatterEditor('{name:"plate"}', 'json');
    const before = editor.read.children();
    const element = before[0] as TCodeBlockElement;

    formatCodeBlock(editor, { element });

    expect(editor.read.children()).toEqual(before);
  });

  it('formats valid json code blocks in place', () => {
    const editor = createFormatterEditor(
      '{"name":"plate","type":"editor"}',
      'json'
    );
    const element = editor.read.children()[0] as TCodeBlockElement;

    formatCodeBlock(editor, { element });

    expect((editor.read.children()[0] as TCodeBlockElement).children).toEqual([
      { children: [{ text: '{' }], type: 'code_line' },
      { children: [{ text: '  "name": "plate",' }], type: 'code_line' },
      { children: [{ text: '  "type": "editor"' }], type: 'code_line' },
      { children: [{ text: '}' }], type: 'code_line' },
    ]);
  });

  it('formats json into separate code lines', () => {
    const lowlight = {
      highlight: mock(() => ({ value: [] })),
      highlightAuto: mock(() => ({ value: [] })),
      listLanguages: mock(() => ['json']),
    };
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseCodeBlockPlugin.configure({
          options: {
            lowlight: lowlight as any,
          },
        }),
      ],
      value: [
        {
          children: [
            {
              children: [{ text: '{"name":"plate","type":"editor"}' }],
              type: 'code_line',
            },
          ],
          lang: 'json',
          type: 'code_block',
        },
      ],
    } as any);
    const element = editor.read.children()[0] as TCodeBlockElement;
    formatCodeBlock(editor, { element });

    expect(
      (editor.read.children()[0] as TCodeBlockElement).children.map(
        (line: any) => line.children[0].text
      )
    ).toEqual(['{', '  "name": "plate",', '  "type": "editor"', '}']);
    expect(
      (editor.read.children()[0] as TCodeBlockElement).children.every(
        (line: any) => line.type === 'code_line'
      )
    ).toBe(true);
  });
});
