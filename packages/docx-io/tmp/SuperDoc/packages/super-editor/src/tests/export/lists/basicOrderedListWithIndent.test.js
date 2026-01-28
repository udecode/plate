// prettier-ignore
import { getExportedResult } from '../export-helpers/index';

describe('[list_with_indents.docx] simple ordered with indent', async () => {
  // The file for this set of test
  const fileName = 'list_with_indents.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('should keep initial indent', () => {
    const itemIndex = 2;
    const firstItem = body.elements[itemIndex];

    const pPr = firstItem.elements.find((el) => el.name === 'w:pPr');
    const indent = pPr.elements.find((el) => el.name === 'w:ind');
    expect(indent).toBeDefined();
    expect(indent.attributes['w:left']).toEqual(540);
    expect(indent.attributes['w:hanging']).toEqual(270);
  });
});
