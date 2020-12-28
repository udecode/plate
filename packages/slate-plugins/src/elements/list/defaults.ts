import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@udecode/slate-plugins-common';
import { StyledElement } from '../../components/StyledComponent/StyledElement';
import { DEFAULTS_PARAGRAPH } from '../paragraph/defaults';
import { ListKeyOption, ListPluginOptionsValues } from './types';

export const DEFAULTS_LIST: Record<ListKeyOption, ListPluginOptionsValues> = {
  ul: {
    component: StyledElement,
    type: ELEMENT_UL,
    rootProps: {
      className: 'slate-ul',
      as: 'ul',
      styles: {
        root: {
          paddingInlineStart: '24px',
          marginBlockStart: '0',
          marginBlockEnd: '0',
        },
      },
    },
  },
  ol: {
    component: StyledElement,
    type: ELEMENT_OL,
    rootProps: {
      className: 'slate-ol',
      as: 'ol',
      styles: {
        root: {
          paddingInlineStart: '24px',
          marginBlockStart: '0',
          marginBlockEnd: '0',
        },
      },
    },
  },
  li: {
    component: StyledElement,
    type: ELEMENT_LI,
    rootProps: {
      className: 'slate-li',
      as: 'li',
    },
  },
  ...DEFAULTS_PARAGRAPH,
};
