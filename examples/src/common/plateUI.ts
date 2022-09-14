import {
  CodeBlockElement,
  createPlateUI,
  ELEMENT_CODE_BLOCK,
  ELEMENT_PARAGRAPH,
  StyledElement,
  withProps,
} from '@udecode/plate';
import tw from 'twin.macro';

export const plateUI = createPlateUI({
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
    // as: 'p',
    styles: {
      root: tw`m-0 py-1 px-0`,
    },
    prefixClassNames: 'p',
  }),
});
