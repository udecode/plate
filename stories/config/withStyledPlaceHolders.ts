import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  withPlaceholders,
} from '@udecode/slate-plugins';

export const withStyledPlaceHolders = (components: any) =>
  withPlaceholders(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
      styles: {
        placeholder: {
          padding: '4px 0 0',
        },
      },
    },
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
      styles: {
        placeholder: {
          fontSize: '1.875em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    },
  ]);
