// Remove redundant data attributes
export const stripPliteDataAttributes = (rawHtml: string): string =>
  rawHtml
    .replaceAll(/ data-plite(?:-node|-type|-leaf|-string)="[^"]+"/g, '')
    .replaceAll(/ data-testid="[^"]+"/g, '');
