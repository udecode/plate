import type { SlateEditor, TCodeBlockElement } from 'platejs';

import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { formatCodeBlock, isLangSupported, isValidSyntax } from './formatter';

const createEditor = (code: string) => {
  let redecorateCalls = 0;
  const editor = {
    api: {
      redecorate: () => {
        redecorateCalls += 1;
      },
      string: mock(() => code),
    },
    getType: (key: string) => key,
    tf: {
      replaceNodes: mock(),
    },
  } as unknown as SlateEditor;

  return {
    editor,
    getRedecorateCalls: () => redecorateCalls,
  };
};

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
    const { editor } = createEditor('{"name":"plate"}');

    formatCodeBlock(editor, {
      element: {
        children: [],
        lang: 'javascript',
        type: 'code_block',
      } as unknown as TCodeBlockElement,
    });

    expect(editor.tf.replaceNodes).not.toHaveBeenCalled();
  });

  it('does nothing when the code is invalid for the language', () => {
    const { editor } = createEditor('{name:"plate"}');

    formatCodeBlock(editor, {
      element: {
        children: [],
        lang: 'json',
        type: 'code_block',
      } as unknown as TCodeBlockElement,
    });

    expect(editor.tf.replaceNodes).not.toHaveBeenCalled();
  });

  it('formats valid json code blocks in place', () => {
    const { editor, getRedecorateCalls } = createEditor(
      '{"name":"plate","type":"editor"}'
    );
    const element = {
      children: [],
      lang: 'json',
      type: 'code_block',
    } as unknown as TCodeBlockElement;

    formatCodeBlock(editor, { element });

    expect(editor.tf.replaceNodes).toHaveBeenCalledWith(
      [
        { children: [{ text: '{' }], type: 'code_line' },
        { children: [{ text: '  "name": "plate",' }], type: 'code_line' },
        { children: [{ text: '  "type": "editor"' }], type: 'code_line' },
        { children: [{ text: '}' }], type: 'code_line' },
      ],
      { at: element, children: true }
    );
    expect(getRedecorateCalls()).toBe(1);
  });

  it('formats json into separate code lines and redecorates', () => {
    const lowlight = {
      highlight: mock(() => ({ value: [] })),
      highlightAuto: mock(() => ({ value: [] })),
      listLanguages: mock(() => ['json']),
    };
    const editor = createSlateEditor({
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
    const element = editor.children[0] as TCodeBlockElement;
    let redecorateCalls = 0;

    editor.api.redecorate = () => {
      redecorateCalls += 1;
    };

    formatCodeBlock(editor, { element });

    expect(
      (editor.children[0] as TCodeBlockElement).children.map(
        (line: any) => line.children[0].text
      )
    ).toEqual(['{', '  "name": "plate",', '  "type": "editor"', '}']);
    expect(
      (editor.children[0] as TCodeBlockElement).children.every(
        (line: any) => line.type === 'code_line'
      )
    ).toBe(true);
    expect(redecorateCalls).toBe(1);
  });
});
