// Remove redundant data attributes
export const stripPliteDataAttributes = (rawHtml: string): string =>
  rawHtml
    .replaceAll(
      / data-editor(?:-end|-inline|-leaf|-node|-node-key|-path|-root|-spacer|-start|-string|-type|-void|-zero-width)?="[^"]*"/g,
      ''
    )
    .replaceAll(/ data-testid="[^"]+"/g, '');
