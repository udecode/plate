import { describe, it, expect } from '@jest/globals';
import { XMLParser } from '../../src/xml/XMLParser';

describe('Nested Runs Test', () => {
  it('should find runs nested inside hyperlinks', () => {
    const paraXml = `
      <w:p>
        <w:pPr><w:spacing w:line="240"/></w:pPr>
        <w:hyperlink r:id="rId7">
          <w:r>
            <w:rPr><w:color w:val="0000ff"/></w:rPr>
            <w:t xml:space="preserve">Link text here</w:t>
          </w:r>
        </w:hyperlink>
        <w:r>
          <w:t xml:space="preserve">Normal text</w:t>
        </w:r>
      </w:p>
    `;

    const runs = XMLParser.extractElements(paraXml, 'w:r');
    console.log(`Found ${runs.length} runs`);

    for (let i = 0; i < runs.length; i++) {
      const text = XMLParser.extractText(runs[i] || '');
      console.log(`Run ${i + 1}: "${text}"`);
    }

    expect(runs.length).toBe(2);
  });

  it('should find runs in actual Working.docx paragraph', async () => {
    const { ZipHandler } = await import('../../src/zip/ZipHandler');
    const path = await import('path');

    const workingPath = path.join(__dirname, '../../Working.docx');
    const zip = new ZipHandler();
    await zip.load(workingPath);

    const docXml = zip.getFileAsString('word/document.xml');
    if (!docXml) throw new Error('No document.xml');

    const bodyContent = XMLParser.extractBody(docXml);
    const paragraphXmls = XMLParser.extractElements(bodyContent, 'w:p');

    console.log(`\nTotal paragraphs: ${paragraphXmls.length}`);

    let totalRuns = 0;
    let runsWithText = 0;

    // Check first paragraph in detail
    console.log('\n=== First Paragraph Detail ===');
    const firstPara = paragraphXmls[0];
    if (firstPara) {
      console.log(`Paragraph length: ${firstPara.length}`);
      console.log(`First 300 chars: ${firstPara.substring(0, 300)}`);

      const runs = XMLParser.extractElements(firstPara, 'w:r');
      console.log(`Found ${runs.length} runs in first paragraph`);

      for (let j = 0; j < runs.length; j++) {
        const run = runs[j];
        if (!run) continue;
        console.log(`\n  Run ${j + 1}:`);
        console.log(`    XML: ${run.substring(0, 150)}`);
        const text = XMLParser.extractText(run);
        console.log(`    Text: "${text}" (length: ${text.length})`);
      }
    }

    // Check first 10 paragraphs
    for (let i = 0; i < Math.min(10, paragraphXmls.length); i++) {
      const paraXml = paragraphXmls[i];
      if (!paraXml) continue;

      const runs = XMLParser.extractElements(paraXml, 'w:r');
      totalRuns += runs.length;

      for (const run of runs) {
        const text = XMLParser.extractText(run);
        if (text.length > 0) {
          runsWithText++;
        }
      }
    }

    console.log(
      `\nFirst 10 paragraphs: ${totalRuns} runs, ${runsWithText} with text`
    );
    expect(runsWithText).toBeGreaterThan(0);
  });
});
