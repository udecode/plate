import { readTestFile } from '../deserializer/__tests__/readTestFile';
import cleanDocx from './cleanDocx';

describe('cleanDocx', () => {
  const MOCK_RTF = 'Whatever, RTF is only needed to process images';

  it('Rebuilds nested lists', () => {
    const html = readTestFile('input/nested-lists.html');
    const expected = readTestFile('output/nested-lists.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Treats in-text line-feed as a space', () => {
    const html = readTestFile('input/whitespaces-1.html');
    const expected = readTestFile('output/whitespaces-1.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Ignores extra space in soft breaks', () => {
    const html = readTestFile('input/whitespaces-2.html');
    const expected = readTestFile('output/whitespaces-2.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Ignores HTML whitespace', () => {
    const html = readTestFile('input/whitespaces-3.html');
    const expected = readTestFile('output/whitespaces-3.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Cleans empty paragraphs', () => {
    const html = readTestFile('input/empty-paragraphs.html');
    const expected = readTestFile('output/empty-paragraphs.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });

  it('Replaces br with line-feed', () => {
    const html = readTestFile('input/brs.html');
    const expected = readTestFile('output/brs.html');
    const result = cleanDocx(html, MOCK_RTF);
    expect(result).toBe(expected);
  });
});
