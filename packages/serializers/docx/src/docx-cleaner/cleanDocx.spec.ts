import { cleanDocx } from './cleanDocx';

import { readTestFile } from '@/serializers/docx/src/__tests__/readTestFile';

describe('cleanDocx', () => {
  const MOCK_RTF = 'Whatever, RTF is only needed to process images';

  // it('Rebuilds nested lists', () => {
  //   const html = readTestFile(
  //     '../docx-cleaner/__tests__/input/nested-lists.html'
  //   );
  //   const expected = readTestFile(
  //     '../docx-cleaner/__tests__/output/nested-lists.html'
  //   );
  //   const result = cleanDocx(html, MOCK_RTF);
  //   expect(result).toBe(expected);
  // });

  it('Treats in-text line-feed as a space', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/whitespaces-1.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/whitespaces-1.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Ignores extra space in soft breaks', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/whitespaces-2.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/whitespaces-2.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Ignores HTML whitespace', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/whitespaces-3.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/whitespaces-3.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Cleans empty paragraphs', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/empty-paragraphs.html'
    );
    const expected = readTestFile(
      '../docx-cleaner/__tests__/output/empty-paragraphs.html'
    );
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Replaces br with line-feed', () => {
    const html = readTestFile('../docx-cleaner/__tests__/input/brs.html');
    const expected = readTestFile('../docx-cleaner/__tests__/output/brs.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  // it('Stylesheet', () => {
  //   const html = readTestFile(
  //     '../docx-cleaner/__tests__/input/custom-styles.html'
  //   );
  //   const expected = readTestFile(
  //     '../docx-cleaner/__tests__/output/custom-styles.html'
  //   );
  //   const result = cleanDocx(html, MOCK_RTF);
  //   expect(1).toBe(1);
  //   // expect(result).toBe(expected);
  // });
});
