// Remove redundant data attributes
export const stripSlateDataAttributes = (rawHtml: string): string =>
  rawHtml
    .replace(/( data-slate)(-node|-type|-leaf)="[^"]+"/gm, '')
    .replace(/( data-testid)="[^"]+"/gm, '');
