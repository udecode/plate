import { convert } from '@americanexpress/css-to-js';

export const styleSheetToInlineStyles = (document: Document) => {
  const styleHtml = document.getElementsByTagName('style')[0]?.innerHTML;
  if (!styleHtml) return;

  console.log(convert(``));
};
