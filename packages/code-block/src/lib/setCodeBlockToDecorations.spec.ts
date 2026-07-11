import type { BaseEditor } from '@platejs/core';
import type { TCodeBlockElement } from '@platejs/utils';

import { createBaseEditor } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { createLowlight } from 'lowlight';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import {
  CODE_LINE_TO_DECORATIONS,
  codeBlockToDecorations,
  resetCodeBlockDecorations,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';

const mockLowlight = createLowlight();
const mockHighlight = spyOn(mockLowlight, 'highlight');
const mockHighlightAuto = spyOn(mockLowlight, 'highlightAuto');
const mockListLanguages = spyOn(mockLowlight, 'listLanguages');
const mockRegister = spyOn(mockLowlight, 'register');
const mockRegisterAlias = spyOn(mockLowlight, 'registerAlias');

type HighlightResult = ReturnType<typeof mockLowlight.highlight>;

const highlightText = (value: string, className?: string[]) =>
  className
    ? {
        children: [{ type: 'text' as const, value }],
        properties: { className },
        tagName: 'span',
        type: 'element' as const,
      }
    : { type: 'text' as const, value };

const highlightResult = (
  ...children: HighlightResult['children']
): HighlightResult => ({ children, type: 'root' });

const getCodeLine = (codeBlock: TCodeBlockElement, index = 0) => {
  const codeLine = codeBlock.children[index];

  if (!ElementApi.isElement(codeLine)) {
    throw new Error(`Expected code line at index ${index}`);
  }

  return codeLine;
};

let editor: BaseEditor;

beforeEach(() => {
  // Reset mocks
  mockHighlight.mockReset();
  mockHighlightAuto.mockReset();
  mockListLanguages.mockReset();
  mockRegister.mockReset();
  mockRegisterAlias.mockReset();
  mockListLanguages.mockReturnValue(['javascript', 'typescript']);

  editor = createBaseEditor({
    plugins: [
      BaseCodeBlockPlugin.configure({
        options: {
          defaultLanguage: 'javascript',
          lowlight: mockLowlight,
        },
      }),
    ],
  });
  spyOn(editor.api.debug, 'error');
  spyOn(editor.api.debug, 'warn');
});

describe('codeBlockToDecorations', () => {
  it('returns empty decorations for plaintext language', () => {
    // Create a code block with plaintext
    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'code_line' }],
      lang: 'plaintext',
      type: 'code_block',
    };

    const blockPath = [0];
    const result = codeBlockToDecorations(editor, [codeBlock, blockPath]);

    // Should have one entry for the code line
    expect(result.size).toBe(1);

    // The decorations for the line should be empty
    const lineDecorations = result.get(getCodeLine(codeBlock));
    expect(lineDecorations).toEqual([]);

    // Lowlight highlight should not be called
    expect(mockHighlight).not.toHaveBeenCalled();
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('returns decorations for specified language', () => {
    // Mock highlight result
    mockHighlight.mockReturnValue(
      highlightResult(
        highlightText('const', ['token', 'keyword']),
        highlightText(' x = '),
        highlightText('1', ['token', 'number']),
        highlightText(';')
      )
    );

    // Create a code block with JavaScript
    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'code_line' }],
      lang: 'javascript',
      type: 'code_block',
    };

    const blockPath = [0];
    const result = codeBlockToDecorations(editor, [codeBlock, blockPath]);

    // Should have one entry for the code line
    expect(result.size).toBe(1);

    // Get decorations for the line
    const lineDecorations = result.get(getCodeLine(codeBlock));
    expect(lineDecorations).toHaveLength(4);

    // Check first decoration (const)
    expect(lineDecorations?.[0]).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0] },
      className: 'token keyword',
      focus: { offset: 5, path: [0, 0, 0] },
    });

    // Check second decoration (space)
    expect(lineDecorations?.[1]).toMatchObject({
      anchor: { offset: 5, path: [0, 0, 0] },
      className: '',
      focus: { offset: 10, path: [0, 0, 0] },
    });

    // Check third decoration (number)
    expect(lineDecorations?.[2]).toMatchObject({
      anchor: { offset: 10, path: [0, 0, 0] },
      className: 'token number',
      focus: { offset: 11, path: [0, 0, 0] },
    });

    // Check fourth decoration (semicolon)
    expect(lineDecorations?.[3]).toMatchObject({
      anchor: { offset: 11, path: [0, 0, 0] },
      className: '',
      focus: { offset: 12, path: [0, 0, 0] },
    });

    // Lowlight highlight should be called with correct params
    expect(mockHighlight).toHaveBeenCalledWith('javascript', 'const x = 1;');
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('patches python grammar before highlighting', () => {
    mockHighlight.mockReturnValue(
      highlightResult(
        highlightText('# Python class with type hints', ['hljs-comment'])
      )
    );

    const codeBlock: TCodeBlockElement = {
      children: [
        {
          children: [{ text: '# Python class with type hints' }],
          type: 'code_line',
        },
      ],
      lang: 'python',
      type: 'code_block',
    };

    const result = codeBlockToDecorations(editor, [codeBlock, [0]]);

    expect(result.get(getCodeLine(codeBlock))?.[0]).toMatchObject({
      className: 'hljs-comment',
    });
    expect(mockRegister).toHaveBeenCalledWith('python', expect.any(Function));
    expect(mockRegisterAlias).toHaveBeenCalledWith('python', [
      'py',
      'gyp',
      'ipython',
    ]);
    expect(mockHighlight).toHaveBeenCalledWith(
      'python',
      '# Python class with type hints'
    );
  });

  it('use auto detection when language is "auto"', () => {
    // Mock highlight auto result
    mockHighlightAuto.mockReturnValue(
      highlightResult(highlightText('const x = 1;'))
    );

    // Create a code block with auto language
    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'code_line' }],
      lang: 'auto',
      type: 'code_block',
    };

    const blockPath = [0];
    codeBlockToDecorations(editor, [codeBlock, blockPath]);

    // Lowlight highlightAuto should be called with correct params
    expect(mockHighlightAuto).toHaveBeenCalledWith('const x = 1;');
    expect(mockHighlight).not.toHaveBeenCalled();
  });

  it('use default language when no language is specified', () => {
    // Mock highlight result
    mockHighlight.mockReturnValue(
      highlightResult(highlightText('const x = 1;'))
    );

    // Create a code block with no language
    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'code_line' }],
      type: 'code_block',
    };

    const blockPath = [0];
    codeBlockToDecorations(editor, [codeBlock, blockPath]);

    // Lowlight highlight should be called with default language
    expect(mockHighlight).toHaveBeenCalledWith('javascript', 'const x = 1;');
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('handle multiline code blocks', () => {
    // Mock highlight result for multiline code
    mockHighlight.mockReturnValue(
      highlightResult(
        highlightText('function', ['token', 'keyword']),
        highlightText(' test() {\n  '),
        highlightText('return', ['token', 'keyword']),
        highlightText(' true;\n}')
      )
    );

    // Create a multiline code block
    const codeBlock: TCodeBlockElement = {
      children: [
        { children: [{ text: 'function test() {' }], type: 'code_line' },
        { children: [{ text: '  return true;' }], type: 'code_line' },
        { children: [{ text: '}' }], type: 'code_line' },
      ],
      lang: 'javascript',
      type: 'code_block',
    };

    const blockPath = [0];
    const result = codeBlockToDecorations(editor, [codeBlock, blockPath]);

    // Should have three entries for the code lines
    expect(result.size).toBe(3);

    // First line should have 2 decorations
    const line1Decorations = result.get(getCodeLine(codeBlock));
    expect(line1Decorations).toHaveLength(2);

    // Second line should have 3 decorations (spaces, return keyword, and rest of line)
    const line2Decorations = result.get(getCodeLine(codeBlock, 1));
    expect(line2Decorations).toHaveLength(3);
    expect(line2Decorations?.[0]).toMatchObject({
      anchor: { offset: 0, path: [0, 1, 0] },
      className: '',
      focus: { offset: 2, path: [0, 1, 0] },
    });
    expect(line2Decorations?.[1]).toMatchObject({
      anchor: { offset: 2, path: [0, 1, 0] },
      className: 'token keyword',
      focus: { offset: 8, path: [0, 1, 0] },
    });
    expect(line2Decorations?.[2]).toMatchObject({
      anchor: { offset: 8, path: [0, 1, 0] },
      className: '',
      focus: { offset: 14, path: [0, 1, 0] },
    });

    // Third line should have 1 decoration
    const line3Decorations = result.get(getCodeLine(codeBlock, 2));
    expect(line3Decorations).toHaveLength(1);
  });

  it('warns and falls back to plaintext when a registered language fails to highlight', () => {
    const error = new Error('boom');
    mockHighlight.mockImplementation(() => {
      throw error;
    });

    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const x = 1;' }], type: 'code_line' }],
      lang: 'javascript',
      type: 'code_block',
    };

    const result = codeBlockToDecorations(editor, [codeBlock, [0]]);

    expect(result.get(getCodeLine(codeBlock))).toEqual([]);
    expect(editor.api.debug.error).not.toHaveBeenCalled();
    expect(editor.api.debug.warn).toHaveBeenCalledWith(
      'Could not highlight with Highlight.js for language "javascript". Falling back to plaintext',
      'CODE_HIGHLIGHT',
      error
    );
  });

  it('warns and falls back to plaintext for unregistered languages', () => {
    const error = new Error('missing');
    mockListLanguages.mockReturnValue(['javascript']);
    mockHighlight.mockImplementation(() => {
      throw error;
    });

    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'SELECT 1' }], type: 'code_line' }],
      lang: 'sql',
      type: 'code_block',
    };

    const result = codeBlockToDecorations(editor, [codeBlock, [0]]);

    expect(result.get(getCodeLine(codeBlock))).toEqual([]);
    expect(editor.api.debug.error).not.toHaveBeenCalled();
    expect(editor.api.debug.warn).toHaveBeenCalledWith(
      'Language "sql" is not registered. Falling back to plaintext'
    );
  });
});

describe('decoration cache helpers', () => {
  it('stores decorations for each code line in the cache', () => {
    mockHighlight.mockReturnValue(
      highlightResult(highlightText('const', ['token', 'keyword']))
    );

    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const' }], type: 'code_line' }],
      lang: 'javascript',
      type: 'code_block',
    };
    const codeLine = getCodeLine(codeBlock);

    setCodeBlockToDecorations(editor, [codeBlock, [0]]);

    expect(CODE_LINE_TO_DECORATIONS.get(codeLine)).toEqual([
      expect.objectContaining({
        className: 'token keyword',
      }),
    ]);
  });

  it('clears cached decorations for every code line in a block', () => {
    const codeBlock: TCodeBlockElement = {
      children: [
        { children: [{ text: 'const' }], type: 'code_line' },
        { children: [{ text: 'return' }], type: 'code_line' },
      ],
      lang: 'javascript',
      type: 'code_block',
    };
    const firstLine = getCodeLine(codeBlock);
    const secondLine = getCodeLine(codeBlock, 1);

    CODE_LINE_TO_DECORATIONS.set(firstLine, []);
    CODE_LINE_TO_DECORATIONS.set(secondLine, []);

    resetCodeBlockDecorations(codeBlock);

    expect(CODE_LINE_TO_DECORATIONS.get(firstLine)).toBeUndefined();
    expect(CODE_LINE_TO_DECORATIONS.get(secondLine)).toBeUndefined();
  });
});
