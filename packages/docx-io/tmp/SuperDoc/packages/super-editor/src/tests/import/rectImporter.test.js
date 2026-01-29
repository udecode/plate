import { expect, it, describe, beforeEach } from 'vitest';
import {
  handlePictNode,
  handleVRectImport,
  buildVRectStyles,
  parsePointsToPixels,
} from '../../core/super-converter/v2/importer/pictNodeImporter.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';

describe('RectImporter', () => {
  let mockParams;

  beforeEach(() => {
    mockParams = {
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    };
  });

  describe('handlePictNode with v:rect elements', () => {
    it('should handle v:rect elements and return contentBlock', () => {
      const nodes = [
        {
          name: 'w:p',
          elements: [
            {
              name: 'w:r',
              elements: [
                {
                  name: 'w:pict',
                  elements: [
                    {
                      name: 'v:rect',
                      attributes: {
                        style: 'width: 100pt; height: 2pt;',
                        fillcolor: '#000000',
                        'o:hr': 't',
                        'o:hralign': 'center',
                        'o:hrstd': 't',
                        stroked: 'f',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = handlePictNode({ nodes, ...mockParams });

      expect(result.nodes).toHaveLength(1);
      expect(result.consumed).toBe(1);

      const node = result.nodes[0];
      expect(node.type).toBe('paragraph');
      expect(node.content).toHaveLength(1);
      expect(node.content[0].type).toBe('contentBlock');

      const contentBlock = node.content[0];
      expect(contentBlock.attrs.attributes).toBeDefined();
      expect(contentBlock.attrs.style).toBeDefined();
      expect(contentBlock.attrs.size).toBeDefined();
      expect(contentBlock.attrs.background).toBe('#000000');
      expect(contentBlock.attrs.horizontalRule).toBe(true);
      expect(contentBlock.attrs.vmlAttributes).toBeDefined();
    });

    it('should handle v:rect elements without style attribute', () => {
      const nodes = [
        {
          name: 'w:p',
          elements: [
            {
              name: 'w:r',
              elements: [
                {
                  name: 'w:pict',
                  elements: [
                    {
                      name: 'v:rect',
                      attributes: {
                        fillcolor: '#FF0000',
                        'o:hr': 't',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = handlePictNode({ nodes, ...mockParams });

      expect(result.nodes).toHaveLength(1);
      expect(result.consumed).toBe(1);

      const node = result.nodes[0];
      const contentBlock = node.content[0];
      expect(contentBlock.attrs.attributes).toBeDefined();
      expect(contentBlock.attrs.style).toBeUndefined();
      expect(contentBlock.attrs.size).toBeUndefined();
      expect(contentBlock.attrs.background).toBe('#FF0000');
      expect(contentBlock.attrs.horizontalRule).toBe(true);
    });

    it('should handle v:rect elements with paragraph spacing', () => {
      const nodes = [
        {
          name: 'w:p',
          attributes: { 'w:rsidRDefault': 'test123' },
          elements: [
            {
              name: 'w:pPr',
              elements: [
                {
                  name: 'w:spacing',
                  attributes: {
                    'w:after': '240', // 12pt in twips
                    'w:before': '120', // 6pt in twips
                    'w:line': '276', // 1.15 line spacing
                    'w:lineRule': 'auto',
                  },
                },
              ],
            },
            {
              name: 'w:r',
              elements: [
                {
                  name: 'w:pict',
                  elements: [
                    {
                      name: 'v:rect',
                      attributes: {
                        style: 'width: 50pt; height: 1pt;',
                        'o:hr': 't',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = handlePictNode({ nodes, ...mockParams });

      expect(result.nodes).toHaveLength(1);
      expect(result.consumed).toBe(1);

      const node = result.nodes[0];
      expect(node.attrs.rsidRDefault).toBe('test123');
      expect(node.attrs.spacing).toBeDefined();
      expect(node.attrs.spacing.lineSpaceAfter).toBe(16); // 240 twips = 12px
      expect(node.attrs.spacing.lineSpaceBefore).toBe(8); // 120 twips = 6px
      expect(node.attrs.spacing.line).toBe(1.15);
      expect(node.attrs.spacing.lineRule).toBe('auto');
    });

    it('should return empty result for non-v:rect pict elements', () => {
      const nodes = [
        {
          name: 'w:p',
          elements: [
            {
              name: 'w:r',
              elements: [
                {
                  name: 'w:pict',
                  elements: [
                    {
                      name: 'v:shape',
                      attributes: { style: 'width: 100pt; height: 50pt;' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = handlePictNode({ nodes, ...mockParams });

      expect(result.nodes).toHaveLength(0);
      expect(result.consumed).toBe(1);
    });

    it('should return empty result for non-pict nodes', () => {
      const nodes = [
        {
          name: 'w:p',
          elements: [
            {
              name: 'w:r',
              elements: [
                {
                  name: 'w:drawing',
                  attributes: {},
                },
              ],
            },
          ],
        },
      ];

      const result = handlePictNode({ nodes, ...mockParams });

      expect(result.nodes).toHaveLength(0);
      expect(result.consumed).toBe(0);
    });
  });

  describe('handleVRectImport', () => {
    it('should process v:rect with full style attributes', () => {
      const rect = {
        attributes: {
          style: 'width: 200pt; height: 3pt; margin-left: 10pt;',
          fillcolor: '#333333',
          'o:hr': 't',
          'o:hralign': 'left',
          'o:hrstd': 't',
          stroked: 't',
        },
      };

      const pNode = {
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:spacing',
                attributes: { 'w:after': '240' },
              },
            ],
          },
        ],
      };

      const result = handleVRectImport({ rect, pNode });

      expect(result.type).toBe('paragraph');
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('contentBlock');

      const contentBlock = result.content[0];
      expect(contentBlock.attrs.attributes).toEqual(rect.attributes);
      expect(contentBlock.attrs.style).toBe('width: 200pt;height: 3pt;margin-left: 10pt;');
      expect(contentBlock.attrs.size.height).toBe(4); // 3pt * 1.33 ≈ 4px
      expect(contentBlock.attrs.background).toBe('#333333');
      expect(contentBlock.attrs.horizontalRule).toBe(true);
      expect(contentBlock.attrs.vmlAttributes.hralign).toBe('left');
      expect(contentBlock.attrs.vmlAttributes.hrstd).toBe('t');
      expect(contentBlock.attrs.vmlAttributes.hr).toBe('t');
      expect(contentBlock.attrs.vmlAttributes.stroked).toBe('t');

      // If hr is true, the width should be 100% - to double check
      expect(contentBlock.attrs.size.width).toBe(266);
    });

    it('should handle v:rect with o:hr attribute for full page width', () => {
      const rect = {
        attributes: {
          style: 'width: 100pt; height: 2pt;',
          'o:hr': 't',
        },
      };

      const pNode = { elements: [] };

      const result = handleVRectImport({ rect, pNode });

      const contentBlock = result.content[0];
      expect(contentBlock.attrs.size.width).toBe(133);
      expect(contentBlock.attrs.horizontalRule).toBe(true);
    });

    it('should handle v:rect without style attribute', () => {
      const rect = {
        attributes: {
          fillcolor: '#CCCCCC',
          'o:hrstd': 't',
        },
      };

      const pNode = { elements: [] };

      const result = handleVRectImport({ rect, pNode });

      const contentBlock = result.content[0];
      expect(contentBlock.attrs.style).toBeUndefined();
      expect(contentBlock.attrs.size).toBeUndefined();
      expect(contentBlock.attrs.background).toBe('#CCCCCC');
      expect(contentBlock.attrs.horizontalRule).toBe(true);
    });

    it('should handle v:rect with only basic attributes', () => {
      const rect = {
        attributes: {
          id: 'rect1',
          fillcolor: '#FF0000',
        },
      };

      const pNode = { elements: [] };

      const result = handleVRectImport({ rect, pNode });

      const contentBlock = result.content[0];
      expect(contentBlock.attrs.attributes.id).toBe('rect1');
      expect(contentBlock.attrs.background).toBe('#FF0000');
      expect(contentBlock.attrs.horizontalRule).toBeFalsy();
      expect(contentBlock.attrs.vmlAttributes).toBeUndefined();
    });
  });

  describe('parsePointsToPixels', () => {
    it('should convert points to pixels correctly', () => {
      expect(parsePointsToPixels('12pt')).toBe(16); // 12 * 1.33 ≈ 16
      expect(parsePointsToPixels('24pt')).toBe(32); // 24 * 1.33 ≈ 32
      expect(parsePointsToPixels('6pt')).toBe(8); // 6 * 1.33 ≈ 8
    });

    it('should handle pixel values', () => {
      expect(parsePointsToPixels('16px')).toBe(16);
      expect(parsePointsToPixels('32px')).toBe(32);
      expect(parsePointsToPixels('100px')).toBe(100);
    });

    it('should handle numeric values', () => {
      expect(parsePointsToPixels('100')).toBe(100);
      expect(parsePointsToPixels('50')).toBe(50);
      expect(parsePointsToPixels('0')).toBe(0);
    });

    it('should handle non-string values', () => {
      expect(parsePointsToPixels(100)).toBe(100);
      expect(parsePointsToPixels(50)).toBe(50);
      expect(parsePointsToPixels(null)).toBe(null);
      expect(parsePointsToPixels(undefined)).toBe(undefined);
    });

    it('should handle invalid string values', () => {
      expect(parsePointsToPixels('invalid')).toBe(0);
      expect(parsePointsToPixels('abcpt')).toBe(0);
      expect(parsePointsToPixels('')).toBe(0);
    });

    it('should round pixel values correctly', () => {
      expect(parsePointsToPixels('10pt')).toBe(14); // 10 * 1.33 = 13.3, rounded to 14
      expect(parsePointsToPixels('15pt')).toBe(20); // 15 * 1.33 = 19.95, rounded to 20
    });
  });
});
