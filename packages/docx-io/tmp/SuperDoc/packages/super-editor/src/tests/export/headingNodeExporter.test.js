import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportSchemaToJson } from '../../core/super-converter/exporter.js';

describe('heading node export', () => {
  it('converts heading to paragraph with Word heading style', () => {
    const mockParams = {
      node: {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Test' }],
      },
      editor: {
        extensionService: { extensions: [] },
      },
    };

    const result = exportSchemaToJson(mockParams);

    // Check it's a paragraph with Heading2 style
    expect(result.name).toBe('w:p');
    const pPr = result.elements.find((el) => el?.name === 'w:pPr');
    const pStyle = pPr.elements.find((el) => el?.name === 'w:pStyle');
    expect(pStyle.attributes['w:val']).toBe('Heading2');
  });
});
