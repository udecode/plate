import {
  createPlateUI,
  ELEMENT_CODE_BLOCK,
  ELEMENT_PARAGRAPH,
  PlateCodeBlockElement,
  StyledElement,
  withProps,
} from '@udecode/plate';

export const plateUI = createPlateUI({
  [ELEMENT_CODE_BLOCK]: PlateCodeBlockElement,
  [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
    // as: 'p',
    styles: {
      root: {
        margin: 0,
        padding: '4px 0',
      },
    },
    prefixClassNames: 'p',
  }),
});
