import { expect, it, describe, beforeEach } from 'vitest';
import { getExportedResult } from './export-helpers/index';

describe('RectNodeExporter', async () => {
  const fileName = 'vrect-node.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('should export v:rect with all attributes', () => {
    const rect = body.elements[3].elements[1].elements[0].elements[0];
    expect(rect.attributes.id).toBe('_x0000_i1079');
    // Reverts back to the word doc value of 0 width
    expect(rect.attributes.style).toBe('width: 0;height: 1.5pt;');
    expect(rect.attributes.fillcolor).toBe('#a0a0a0');
    expect(rect.attributes['o:hr']).toBe('t');
  });
});
