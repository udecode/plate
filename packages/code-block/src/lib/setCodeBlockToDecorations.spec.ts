import type { SlateEditor, TCodeBlockElement } from 'platejs';

import { createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import {
  CODE_LINE_TO_DECORATIONS,
  codeBlockToDecorations,
  resetCodeBlockDecorations,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';

// Mock lowlight
const mockHighlight = mock();
const mockHighlightAuto = mock();
const mockListLanguages = mock();
const mockLowlight = {
  highlight: mockHighlight,
  highlightAuto: mockHighlightAuto,
  listLanguages: mockListLanguages,
};

let editor: SlateEditor;

beforeEach(() => {
  // Reset mocks
  mockHighlight.mockReset();
  mockHighlightAuto.mockReset();
  mockListLanguages.mockReset();
  mockListLanguages.mockReturnValue(['javascript', 'typescript']);

  // Create a basic editor
  editor = createSlateEditor({
    plugins: [BaseCodeBlockPlugin],
  });

  // Add necessary API methods
  editor.api = {
    debug: {
      error: mock(),
      warn: mock(),
    },
  } as any;

  // Add getOptions method
  editor.getOptions = mock().mockImplementation((plugin: any) => {
    if (plugin === BaseCodeBlockPlugin) {
      return {
        defaultLanguage: 'javascript',
        lowlight: mockLowlight,
      };
    }
    return {};
  }) as any;
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
    const lineDecorations = result.get(codeBlock.children[0] as any);
    expect(lineDecorations).toEqual([]);

    // Lowlight highlight should not be called
    expect(mockHighlight).not.toHaveBeenCalled();
    expect(mockHighlightAuto).not.toHaveBeenCalled();
  });

  it('returns decorations for specified language', () => {
    // Mock highlight result
    mockHighlight.mockReturnValue({
      value: [
        {
          properties: { className: ['token', 'keyword'] },
          value: 'const',
        },
        {
          value: ' x = ',
        },
        {
          properties: { className: ['token', 'number'] },
          value: '1',
        },
        {
          value: ';',
        },
      ],
    });

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
    const lineDecorations = result.get(codeBlock.children[0] as any);
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

  it('use auto detection when language is "auto"', () => {
    // Mock highlight auto result
    mockHighlightAuto.mockReturnValue({
      value: [{ value: 'const x = 1;' }],
    });

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
    mockHighlight.mockReturnValue({
      value: [{ value: 'const x = 1;' }],
    });

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
    mockHighlight.mockReturnValue({
      value: [
        {
          properties: { className: ['token', 'keyword'] },
          value: 'function',
        },
        {
          value: ' test() {\n  ',
        },
        {
          properties: { className: ['token', 'keyword'] },
          value: 'return',
        },
        {
          value: ' true;\n}',
        },
      ],
    });

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
    const line1Decorations = result.get(codeBlock.children[0] as any);
    expect(line1Decorations).toHaveLength(2);

    // Second line should have 3 decorations (spaces, return keyword, and rest of line)
    const line2Decorations = result.get(codeBlock.children[1] as any);
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
    const line3Decorations = result.get(codeBlock.children[2] as any);
    expect(line3Decorations).toHaveLength(1);
  });

  it('logs debug errors for registered languages that fail to highlight', () => {
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

    expect(result.get(codeBlock.children[0] as any)).toEqual([]);
    expect(editor.api.debug.error).toHaveBeenCalledWith(
      error,
      'CODE_HIGHLIGHT'
    );
    expect(editor.api.debug.warn).not.toHaveBeenCalled();
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

    expect(result.get(codeBlock.children[0] as any)).toEqual([]);
    expect(editor.api.debug.error).not.toHaveBeenCalled();
    expect(editor.api.debug.warn).toHaveBeenCalledWith(
      'Language "sql" is not registered. Falling back to plaintext'
    );
  });
});

describe('decoration cache helpers', () => {
  it('stores decorations for each code line in the cache', () => {
    mockHighlight.mockReturnValue({
      value: [
        {
          properties: { className: ['token', 'keyword'] },
          value: 'const',
        },
      ],
    });

    const codeBlock: TCodeBlockElement = {
      children: [{ children: [{ text: 'const' }], type: 'code_line' }],
      lang: 'javascript',
      type: 'code_block',
    };
    const codeLine = codeBlock.children[0] as any;

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
    const firstLine = codeBlock.children[0] as any;
    const secondLine = codeBlock.children[1] as any;

    CODE_LINE_TO_DECORATIONS.set(firstLine, [] as any);
    CODE_LINE_TO_DECORATIONS.set(secondLine, [] as any);

    resetCodeBlockDecorations(codeBlock);

    expect(CODE_LINE_TO_DECORATIONS.get(firstLine)).toBeUndefined();
    expect(CODE_LINE_TO_DECORATIONS.get(secondLine)).toBeUndefined();
  });
});
