import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as listHelpers from './list-numbering-helpers.js';

// Mock the external dependencies
vi.mock('@core/super-converter/v2/importer/listImporter.js', () => ({
  getStyleTagFromStyleId: vi.fn(),
  getAbstractDefinition: vi.fn(),
  getDefinitionForLevel: vi.fn(),
}));

import { getStyleTagFromStyleId } from '@core/super-converter/v2/importer/listImporter.js';

// Import the function we want to test
const { getListDefinitionDetails, ListHelpers } = listHelpers;

describe('getListDefinitionDetails', () => {
  let mockEditor;
  let mockDefinitions;
  let mockAbstracts;
  let generateNewListDefinitionSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create spies on the ListHelpers object methods
    generateNewListDefinitionSpy = vi.spyOn(ListHelpers, 'generateNewListDefinition').mockImplementation(() => {});

    mockDefinitions = {};
    mockAbstracts = {};

    mockEditor = {
      converter: {
        numbering: {
          definitions: mockDefinitions,
          abstracts: mockAbstracts,
        },
        convertedXml: '<mock>xml</mock>',
      },
      schema: {
        nodes: {
          orderedList: { name: 'orderedList' },
          bulletList: { name: 'bulletList' },
        },
      },
      emit: vi.fn(), // Add mock emit function
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return list definition details for valid numId and level', () => {
      // Setup mock data
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [
              { name: 'w:start', attributes: { 'w:val': '1' } },
              { name: 'w:numFmt', attributes: { 'w:val': 'decimal' } },
              { name: 'w:lvlText', attributes: { 'w:val': '%1.' } },
            ],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result).toEqual({
        start: '1',
        numFmt: 'decimal',
        lvlText: '%1.',
        listNumberingType: 'decimal',
        customFormat: undefined,
        abstract: mockAbstracts['abstract1'],
        abstractId: 'abstract1',
      });
    });

    it('should handle custom format when numFmt is custom', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [
              {
                name: 'w:numFmt',
                attributes: {
                  'w:val': 'custom',
                  'w:format': 'customPattern',
                },
              },
            ],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.customFormat).toBe('customPattern');
    });

    it('should handle bullet list format', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [
              { name: 'w:start', attributes: { 'w:val': '1' } },
              { name: 'w:numFmt', attributes: { 'w:val': 'bullet' } },
              { name: 'w:lvlText', attributes: { 'w:val': '•' } },
            ],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.numFmt).toBe('bullet');
      expect(result.lvlText).toBe('•');
    });

    it('should handle string level parameter by converting to number comparison', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '1' }, // String level in XML
            elements: [{ name: 'w:numFmt', attributes: { 'w:val': 'lowerRoman' } }],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 1, // Number level in function call
        editor: mockEditor,
      });

      expect(result.numFmt).toBe('lowerRoman');
    });
  });

  describe('Missing definition handling', () => {
    it('should generate new definition when numDef is missing and listType is provided', () => {
      const result = getListDefinitionDetails({
        numId: 999,
        level: 0,
        listType: 'orderedList',
        editor: mockEditor,
      });

      expect(generateNewListDefinitionSpy).toHaveBeenCalledWith({
        numId: 999,
        listType: 'orderedList',
        editor: mockEditor,
      });
    });

    it('should not generate new definition when listType is not provided', () => {
      getListDefinitionDetails({
        numId: 999,
        level: 0,
        editor: mockEditor,
      });

      expect(generateNewListDefinitionSpy).not.toHaveBeenCalled();
    });

    it('should generate new definition for bulletList type', () => {
      getListDefinitionDetails({
        numId: 888,
        level: 0,
        listType: 'bulletList',
        editor: mockEditor,
      });

      expect(generateNewListDefinitionSpy).toHaveBeenCalledWith({
        numId: 888,
        listType: 'bulletList',
        editor: mockEditor,
      });
    });

    it('should handle existing definition and not call generateNewListDefinition', () => {
      // Setup existing definition
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [{ name: 'w:numFmt', attributes: { 'w:val': 'decimal' } }],
          },
        ],
      };

      getListDefinitionDetails({
        numId: 1,
        level: 0,
        listType: 'orderedList', // Even with listType, shouldn't generate since definition exists
        editor: mockEditor,
      });

      expect(generateNewListDefinitionSpy).not.toHaveBeenCalled();
    });
  });

  describe('Abstract handling', () => {
    it('should return null values when abstract is not found', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'nonexistent' },
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result).toEqual({
        start: null,
        numFmt: null,
        lvlText: null,
        listNumberingType: null,
        customFormat: null,
        abstract: null,
        abstractId: 'nonexistent', // The function correctly returns the abstractId even when abstract is not found
      });
    });

    it('should return partial data when abstract exists but level definition is missing', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '1' }, // Different level
            elements: [{ name: 'w:start', attributes: { 'w:val': '1' } }],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0, // Looking for level 0, but only level 1 exists
        editor: mockEditor,
      });

      expect(result).toEqual({
        start: null,
        numFmt: null,
        lvlText: null,
        listNumberingType: null,
        customFormat: null,
        abstract: mockAbstracts['abstract1'],
        abstractId: 'abstract1',
      });
    });
  });

  describe('Style link recursion', () => {
    it('should follow style link and recurse when tries < 1', () => {
      // Setup original definition
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:numStyleLink',
            attributes: { 'w:val': 'style1' },
          },
        ],
      };

      // Setup linked definition
      mockDefinitions[2] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract2' },
          },
        ],
      };

      mockAbstracts['abstract2'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [
              { name: 'w:start', attributes: { 'w:val': '1' } },
              { name: 'w:numFmt', attributes: { 'w:val': 'decimal' } },
            ],
          },
        ],
      };

      // Mock getStyleTagFromStyleId
      getStyleTagFromStyleId.mockReturnValue({
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:numPr',
                elements: [
                  {
                    name: 'w:numId',
                    attributes: { 'w:val': '2' },
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(getStyleTagFromStyleId).toHaveBeenCalledWith('style1', '<mock>xml</mock>');
      expect(result.start).toBe('1');
      expect(result.numFmt).toBe('decimal');
    });

    it('should not recurse when tries >= 1', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:numStyleLink',
            attributes: { 'w:val': 'style1' },
          },
        ],
      };

      getStyleTagFromStyleId.mockReturnValue({
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:numPr',
                elements: [
                  {
                    name: 'w:numId',
                    attributes: { 'w:val': '2' },
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
        tries: 1, // Max tries reached
      });

      // Should not recurse, should return null values since no level definition exists
      expect(result.abstract).toBe(mockAbstracts['abstract1']);
      expect(result.start).toBe(null);
    });

    it('should handle missing style definition gracefully', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:numStyleLink',
            attributes: { 'w:val': 'nonexistent-style' },
          },
        ],
      };

      getStyleTagFromStyleId.mockReturnValue(null);

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.abstract).toBe(mockAbstracts['abstract1']);
      expect(result.start).toBe(null);
    });

    it('should handle incomplete style definition chain', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:numStyleLink',
            attributes: { 'w:val': 'style1' },
          },
        ],
      };

      // Mock incomplete style definition (missing numId)
      getStyleTagFromStyleId.mockReturnValue({
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:numPr',
                elements: [], // Empty - no numId element
              },
            ],
          },
        ],
      });

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.abstract).toBe(mockAbstracts['abstract1']);
      expect(result.start).toBe(null);
    });

    it('should handle style definition with missing nested elements', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:numStyleLink',
            attributes: { 'w:val': 'style1' },
          },
        ],
      };

      // Mock style definition missing w:numPr
      getStyleTagFromStyleId.mockReturnValue({
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:otherElement',
              },
            ],
          },
        ],
      });

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.abstract).toBe(mockAbstracts['abstract1']);
      expect(result.start).toBe(null);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing attributes gracefully', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [
              { name: 'w:start' }, // Missing attributes
              { name: 'w:numFmt', attributes: {} }, // Empty attributes
              { name: 'w:lvlText', attributes: { 'w:val': 'valid' } },
            ],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.start).toBe(undefined);
      expect(result.numFmt).toBe(undefined);
      expect(result.lvlText).toBe('valid');
    });

    it('should handle missing elements arrays', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        // Missing elements array
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0,
        editor: mockEditor,
      });

      expect(result.abstract).toBe(mockAbstracts['abstract1']);
      expect(result.start).toBe(null);
    });

    it('should handle undefined editor or numbering data', () => {
      const emptyEditor = {
        converter: {
          numbering: {
            definitions: {},
            abstracts: {},
          },
        },
      };

      const result = getListDefinitionDetails({
        numId: 999,
        level: 0,
        editor: emptyEditor,
      });

      expect(result).toEqual({
        start: null,
        numFmt: null,
        lvlText: null,
        listNumberingType: null,
        customFormat: null,
        abstract: null,
        abstractId: undefined,
      });
    });
  });

  describe('Parameter validation and edge cases', () => {
    it('should handle numId as string and convert internally if needed', () => {
      mockDefinitions['1'] = {
        // String key
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [{ name: 'w:numFmt', attributes: { 'w:val': 'decimal' } }],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1, // Number input
        level: 0,
        editor: mockEditor,
      });

      expect(result.numFmt).toBe('decimal');
    });

    it('should handle zero-based level correctly', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' }, // Zero-based level
            elements: [{ name: 'w:numFmt', attributes: { 'w:val': 'decimal' } }],
          },
        ],
      };

      const result = getListDefinitionDetails({
        numId: 1,
        level: 0, // Should match w:ilvl="0"
        editor: mockEditor,
      });

      expect(result.numFmt).toBe('decimal');
    });

    it('should handle missing converter gracefully', () => {
      const badEditor = {
        converter: null,
      };

      expect(() => {
        getListDefinitionDetails({
          numId: 1,
          level: 0,
          editor: badEditor,
        });
      }).toThrow();
    });

    it('should handle missing numbering gracefully', () => {
      const editorWithoutNumbering = {
        converter: {
          // Missing numbering property
        },
      };

      expect(() => {
        getListDefinitionDetails({
          numId: 1,
          level: 0,
          editor: editorWithoutNumbering,
        });
      }).toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with complex nested list structure', () => {
      mockDefinitions[1] = {
        elements: [
          {
            name: 'w:abstractNumId',
            attributes: { 'w:val': 'abstract1' },
          },
        ],
      };

      mockAbstracts['abstract1'] = {
        elements: [
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '0' },
            elements: [
              { name: 'w:start', attributes: { 'w:val': '1' } },
              { name: 'w:numFmt', attributes: { 'w:val': 'decimal' } },
              { name: 'w:lvlText', attributes: { 'w:val': '%1.' } },
            ],
          },
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '1' },
            elements: [
              { name: 'w:start', attributes: { 'w:val': '1' } },
              { name: 'w:numFmt', attributes: { 'w:val': 'lowerRoman' } },
              { name: 'w:lvlText', attributes: { 'w:val': '%2.' } },
            ],
          },
          {
            name: 'w:lvl',
            attributes: { 'w:ilvl': '2' },
            elements: [
              { name: 'w:start', attributes: { 'w:val': '1' } },
              { name: 'w:numFmt', attributes: { 'w:val': 'lowerLetter' } },
              { name: 'w:lvlText', attributes: { 'w:val': '%3)' } },
            ],
          },
        ],
      };

      // Test level 0
      const level0 = getListDefinitionDetails({ numId: 1, level: 0, editor: mockEditor });
      expect(level0.numFmt).toBe('decimal');
      expect(level0.lvlText).toBe('%1.');

      // Test level 1
      const level1 = getListDefinitionDetails({ numId: 1, level: 1, editor: mockEditor });
      expect(level1.numFmt).toBe('lowerRoman');
      expect(level1.lvlText).toBe('%2.');

      // Test level 2
      const level2 = getListDefinitionDetails({ numId: 1, level: 2, editor: mockEditor });
      expect(level2.numFmt).toBe('lowerLetter');
      expect(level2.lvlText).toBe('%3)');
    });
  });
});
