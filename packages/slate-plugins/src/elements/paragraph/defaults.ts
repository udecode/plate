import { StyledElement } from '../../components/StyledComponent/StyledElement';
import { ParagraphKeyOption, ParagraphPluginOptionsValues } from './types';

export const ELEMENT_PARAGRAPH = 'p';

export const DEFAULTS_PARAGRAPH: Record<
  ParagraphKeyOption,
  Required<ParagraphPluginOptionsValues>
> = {
  p: {
    component: StyledElement,
    type: ELEMENT_PARAGRAPH,
    rootProps: {
      className: `slate-${ELEMENT_PARAGRAPH}`,
      as: 'p',
    },
  },
};
