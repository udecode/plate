import { ELEMENT_H1, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { withPlaceholders } from './Placeholder';

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
