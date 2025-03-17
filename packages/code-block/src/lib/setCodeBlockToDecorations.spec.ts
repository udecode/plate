import type { SlateEditor } from '@udecode/plate';

import { createPlateEditor } from '@udecode/plate/react';

import type { TCodeBlockElement } from './types';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import { codeBlockToDecorations } from './setCodeBlockToDecorations';

// Mock lowlight
const mockHighlight = jest.fn();
const mockHighlightAuto = jest.fn();
const mockLowlight = {
  highlight: mockHighlight,
  highlightAuto: mockHighlightAuto,
};

describe('codeBlockToDecorations', () => {
  let editor: SlateEditor;

  beforeEach(() => {
    // Reset mocks
    mockHighlight.mockReset();
    mockHighlightAuto.mockReset();

    // Create a basic editor
    editor = createPlateEditor({
      plugins: [BaseCodeBlockPlugin],
    });

    // Add necessary API methods
    editor.api = {
      debug: {
        error: jest.fn(),
      },
      // Add other required API methods as needed
    } as any;

    // Add getOptions method
    editor.getOptions = jest.fn().mockImplementation((plugin) => {
      if (plugin === BaseCodeBlockPlugin) {
        return {
          defaultLanguage: 'javascript',
          lowlight: mockLowlight,
        };
      }
      return {};
    });
  });

  it('should return empty decorations for plaintext language', () => {
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

  it('should return decorations for specified language', () => {
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

  it('should use auto detection when language is "auto"', () => {
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

  it('should use default language when no language is specified', () => {
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

  it('should handle multiline code blocks', () => {
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
});
