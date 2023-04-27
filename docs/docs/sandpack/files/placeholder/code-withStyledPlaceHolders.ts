export const withStyledPlaceHoldersCode = `import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  withPlaceholders,
} from '@udecode/plate';

export const withStyledPlaceHolders = (components: any) =>
  withPlaceholders(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
    },
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
    },
  ]);
`;

export const withStyledPlaceHoldersFile = {
  '/placeholder/withStyledPlaceHolders.ts': withStyledPlaceHoldersCode,
};
