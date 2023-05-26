import { ELEMENT_H1, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { withPlaceholdersPrimitive } from './Placeholder';

export const withPlaceHolders = (components: any) =>
  withPlaceholdersPrimitive(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
      query: {
        maxLevel: 1,
      },
    },
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
    },
  ]);
