// Remove redundant data attributes
export const stripSlateDataAttributes = (rawHtml: string): string =>
  rawHtml
    .replaceAll(/ data-slate(?:-node|-type|-leaf|-string)="[^"]+"/g, '')
    .replaceAll(/ data-testid="[^"]+"/g, '');
