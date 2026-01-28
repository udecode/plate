import { getExportedResult } from './export-helpers/index';

describe('LineBreakExporter', () => {
  let result;
  let body;

  beforeAll(async () => {
    result = await getExportedResult('line-break.docx');
  });

  beforeEach(() => {
    body = result.elements?.find((el) => el.name === 'w:body');
  });

  it('exports lineBreak nodes wrapped in w:r (run) elements', () => {
    // Grab the first paragraph that contains line breaks
    const paragraphWithLineBreaks = body.elements?.find(
      (el) =>
        el.name === 'w:p' &&
        el.elements?.some((run) => run.name === 'w:r' && run.elements?.some((element) => element.name === 'w:br')),
    );

    expect(paragraphWithLineBreaks).toBeDefined();
    expect(paragraphWithLineBreaks.name).toBe('w:p');

    const runs = paragraphWithLineBreaks.elements?.filter((el) => el.name === 'w:r') || [];
    expect(runs.length).toBeGreaterThan(0);

    const runsWithLineBreaks = runs.filter((run) => run.elements?.some((element) => element.name === 'w:br'));

    expect(runsWithLineBreaks.length).toBeGreaterThan(0);

    // Verify the structure: w:r -> w:br
    runsWithLineBreaks.forEach((run) => {
      expect(run.name).toBe('w:r');
      const lineBreak = run.elements?.find((element) => element.name === 'w:br');
      expect(lineBreak).toBeDefined();
      expect(lineBreak.name).toBe('w:br');
    });
  });
});
