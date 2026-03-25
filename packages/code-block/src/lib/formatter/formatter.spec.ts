import type { Editor, TCodeBlockElement } from 'platejs';

import { formatCodeBlock, isLangSupported, isValidSyntax } from './formatter';

const createEditor = (code: string) =>
  ({
    api: {
      string: mock(() => code),
    },
    tf: {
      insertText: mock(),
    },
  }) as unknown as Editor;

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
    const editor = createEditor('{"name":"plate"}');

    formatCodeBlock(editor, {
      element: {
        children: [],
        lang: 'javascript',
        type: 'code_block',
      } as unknown as TCodeBlockElement,
    });

    expect(editor.tf.insertText).not.toHaveBeenCalled();
  });

  it('does nothing when the code is invalid for the language', () => {
    const editor = createEditor('{name:"plate"}');

    formatCodeBlock(editor, {
      element: {
        children: [],
        lang: 'json',
        type: 'code_block',
      } as unknown as TCodeBlockElement,
    });

    expect(editor.tf.insertText).not.toHaveBeenCalled();
  });

  it('formats valid json code blocks in place', () => {
    const editor = createEditor('{"name":"plate","type":"editor"}');
    const element = {
      children: [],
      lang: 'json',
      type: 'code_block',
    } as unknown as TCodeBlockElement;

    formatCodeBlock(editor, { element });

    expect(editor.tf.insertText).toHaveBeenCalledWith(
      `{
  "name": "plate",
  "type": "editor"
}`,
      { at: element }
    );
  });
});
