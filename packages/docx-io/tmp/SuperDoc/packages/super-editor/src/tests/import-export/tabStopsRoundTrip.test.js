import { expect } from 'vitest';
import { handleParagraphNode } from '@converter/v2/importer/paragraphNodeImporter.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { translateParagraphNode } from '@converter/exporter.js';

describe('Tab Stops Round Trip Tests', () => {
  // Create a minimal editor mock that has the required extensions property
  const createMockEditor = () => ({
    extensions: {
      find: vi.fn(() => null),
    },
    schema: {
      marks: {},
    },
  });

  it('correctly imports and exports tab stops with all attributes', () => {
    // Create a mock DOCX paragraph with tab stops
    const mockDocxParagraph = {
      name: 'w:p',
      elements: [
        {
          name: 'w:pPr',
          elements: [
            {
              name: 'w:tabs',
              elements: [
                {
                  name: 'w:tab',
                  attributes: {
                    'w:val': 'start',
                    'w:pos': '2160',
                  },
                },
                {
                  name: 'w:tab',
                  attributes: {
                    'w:val': 'center',
                    'w:pos': '5040',
                    'w:leader': 'dot',
                  },
                },
                {
                  name: 'w:tab',
                  attributes: {
                    'w:val': 'decimal',
                    'w:pos': '7200',
                    'w:leader': 'underscore',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    // Step 1: Import the DOCX paragraph
    const { nodes } = handleParagraphNode({
      nodes: [mockDocxParagraph],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });

    const importedNode = nodes[0];
    expect(importedNode.type).toBe('paragraph');
    expect(importedNode.attrs.tabStops).toBeDefined();
    expect(importedNode.attrs.tabStops.length).toBe(3);

    // Verify imported tab stops
    const firstTab = importedNode.attrs.tabStops[0];
    expect(firstTab.val).toBe('start');
    expect(firstTab.pos).toBe(144);
    expect(firstTab.leader).toBeUndefined();

    const secondTab = importedNode.attrs.tabStops[1];
    expect(secondTab.val).toBe('center');
    expect(secondTab.pos).toBe(336);
    expect(secondTab.leader).toBe('dot');

    const thirdTab = importedNode.attrs.tabStops[2];
    expect(thirdTab.val).toBe('decimal');
    expect(thirdTab.pos).toBe(480);
    expect(thirdTab.leader).toBe('underscore');

    // Step 2: Export the imported node back to DOCX
    const mockEditor = createMockEditor();
    const exportedResult = translateParagraphNode({
      editor: mockEditor,
      node: importedNode,
    });

    expect(exportedResult.name).toBe('w:p');

    // Find the pPr element
    const pPr = exportedResult.elements.find((el) => el.name === 'w:pPr');
    expect(pPr).toBeDefined();

    // Find the tabs element within pPr
    const tabs = pPr.elements.find((el) => el.name === 'w:tabs');
    expect(tabs).toBeDefined();
    expect(tabs.elements.length).toBe(3);

    // Verify exported tab stops match the original
    const exportedFirstTab = tabs.elements[0];
    expect(exportedFirstTab.name).toBe('w:tab');
    expect(exportedFirstTab.attributes['w:val']).toBe('start');
    expect(exportedFirstTab.attributes['w:pos']).toBe('2160');
    expect(exportedFirstTab.attributes['w:leader']).toBeUndefined();

    const exportedSecondTab = tabs.elements[1];
    expect(exportedSecondTab.name).toBe('w:tab');
    expect(exportedSecondTab.attributes['w:val']).toBe('center');
    expect(exportedSecondTab.attributes['w:pos']).toBe('5040');
    expect(exportedSecondTab.attributes['w:leader']).toBe('dot');

    const exportedThirdTab = tabs.elements[2];
    expect(exportedThirdTab.name).toBe('w:tab');
    expect(exportedThirdTab.attributes['w:val']).toBe('decimal');
    expect(exportedThirdTab.attributes['w:pos']).toBe('7200');
    expect(exportedThirdTab.attributes['w:leader']).toBe('underscore');
  });

  it('correctly handles paragraphs without tab stops in round trip', () => {
    // Create a mock DOCX paragraph without tab stops
    const mockDocxParagraph = {
      name: 'w:p',
      elements: [
        {
          name: 'w:pPr',
          elements: [],
        },
      ],
    };

    // Step 1: Import the DOCX paragraph
    const { nodes } = handleParagraphNode({
      nodes: [mockDocxParagraph],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });

    const importedNode = nodes[0];
    expect(importedNode.type).toBe('paragraph');
    expect(importedNode.attrs.tabStops).toBeUndefined();

    // Step 2: Export the imported node back to DOCX
    const mockEditor = createMockEditor();
    const exportedResult = translateParagraphNode({
      editor: mockEditor,
      node: importedNode,
    });

    expect(exportedResult.name).toBe('w:p');

    // Find the pPr element (if it exists)
    const pPr = exportedResult.elements.find((el) => el.name === 'w:pPr');

    if (pPr) {
      // If pPr exists, it should not contain tabs
      const tabs = pPr.elements?.find((el) => el.name === 'w:tabs');
      expect(tabs).toBeUndefined();
    }
  });

  it('correctly handles tab stops with default values in round trip', () => {
    // Create a mock DOCX paragraph with tab stop that has default val
    const mockDocxParagraph = {
      name: 'w:p',
      elements: [
        {
          name: 'w:pPr',
          elements: [
            {
              name: 'w:tabs',
              elements: [
                {
                  name: 'w:tab',
                  attributes: {
                    'w:pos': '1440',
                    // No w:val provided, should default to 'start'
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    // Step 1: Import the DOCX paragraph
    const { nodes } = handleParagraphNode({
      nodes: [mockDocxParagraph],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });

    const importedNode = nodes[0];
    expect(importedNode.type).toBe('paragraph');
    expect(importedNode.attrs.tabStops).toBeDefined();
    expect(importedNode.attrs.tabStops.length).toBe(1);

    const tab = importedNode.attrs.tabStops[0];
    expect(tab.val).toBe('start'); // Should default to 'start'
    expect(tab.pos).toBe(96);
    expect(tab.leader).toBeUndefined();

    // Step 2: Export the imported node back to DOCX
    const mockEditor = createMockEditor();
    const exportedResult = translateParagraphNode({
      editor: mockEditor,
      node: importedNode,
    });

    const pPr = exportedResult.elements.find((el) => el.name === 'w:pPr');
    const tabs = pPr.elements.find((el) => el.name === 'w:tabs');
    expect(tabs.elements.length).toBe(1);

    const exportedTab = tabs.elements[0];
    expect(exportedTab.attributes['w:val']).toBe('start');
    expect(exportedTab.attributes['w:pos']).toBe('1440');
    expect(exportedTab.attributes['w:leader']).toBeUndefined();
  });

  it('preserves tab stop order in round trip', () => {
    // Create a mock DOCX paragraph with multiple tab stops in specific order
    const mockDocxParagraph = {
      name: 'w:p',
      elements: [
        {
          name: 'w:pPr',
          elements: [
            {
              name: 'w:tabs',
              elements: [
                {
                  name: 'w:tab',
                  attributes: {
                    'w:val': 'end',
                    'w:pos': '8640',
                    'w:leader': 'hyphen',
                  },
                },
                {
                  name: 'w:tab',
                  attributes: {
                    'w:val': 'bar',
                    'w:pos': '1440',
                  },
                },
                {
                  name: 'w:tab',
                  attributes: {
                    'w:val': 'num',
                    'w:pos': '4320',
                    'w:leader': 'middleDot',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    // Step 1: Import the DOCX paragraph
    const { nodes } = handleParagraphNode({
      nodes: [mockDocxParagraph],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });

    const importedNode = nodes[0];
    expect(importedNode.attrs.tabStops.length).toBe(3);

    // Step 2: Export the imported node back to DOCX
    const mockEditor = createMockEditor();
    const exportedResult = translateParagraphNode({
      editor: mockEditor,
      node: importedNode,
    });

    const pPr = exportedResult.elements.find((el) => el.name === 'w:pPr');
    const tabs = pPr.elements.find((el) => el.name === 'w:tabs');
    expect(tabs.elements.length).toBe(3);

    // Verify the order is preserved
    expect(tabs.elements[0].attributes['w:val']).toBe('end');
    expect(tabs.elements[0].attributes['w:pos']).toBe('8640');
    expect(tabs.elements[0].attributes['w:leader']).toBe('hyphen');

    expect(tabs.elements[1].attributes['w:val']).toBe('bar');
    expect(tabs.elements[1].attributes['w:pos']).toBe('1440');
    expect(tabs.elements[1].attributes['w:leader']).toBeUndefined();

    expect(tabs.elements[2].attributes['w:val']).toBe('num');
    expect(tabs.elements[2].attributes['w:pos']).toBe('4320');
    expect(tabs.elements[2].attributes['w:leader']).toBe('middleDot');
  });
});
