import { readTestFile } from '../__tests__/readTestFile';
import { parseHtmlDocument } from './utils/parseHtmlDocument';
import { styleSheetToInlineStyles } from './styleSheetToInlineStyles';

describe('when ', () => {
  it('should be ', () => {
    const html = readTestFile(
      '../docx-cleaner/__tests__/input/custom-styles.html'
    );
    styleSheetToInlineStyles(parseHtmlDocument(html));
    expect(1).toBe(1);
  });
});
