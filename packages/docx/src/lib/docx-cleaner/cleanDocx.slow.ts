import fs from 'node:fs';
import path from 'node:path';

import { cleanDocx } from './cleanDocx';

const readTestFile = (filepath: string): string => {
  const absoluteFilepath = path.resolve(__dirname, filepath);

  return fs.readFileSync(absoluteFilepath, 'utf8');
};

describe('cleanDocx', () => {
  const MOCK_RTF = 'Whatever, RTF is only needed to process images';

  it('Treats in-text line-feed as a space', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/whitespaces-1.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/whitespaces-1.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result.trim()).toBe(expected.trim());
  });

  it('Ignores extra space in soft breaks', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/whitespaces-2.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/whitespaces-2.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result.trim()).toBe(expected.trim());
  });

  it('Ignores HTML whitespace', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/whitespaces-3.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/whitespaces-3.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result.trim()).toBe(expected.trim());
  });

  it('Cleans empty paragraphs', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/empty-paragraphs.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/empty-paragraphs.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result.trim()).toBe(expected.trim());
  });

  it('Replaces br with line-feed', () => {
    const html = readTestFile('../docx-cleaner/__tests__/input/brs.html');
    const expected = readTestFile('../docx-cleaner/__tests__/output/brs.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result.trim()).toBe(expected.trim());
  });
});
