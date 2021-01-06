import { StyledElement } from '../../components/StyledComponent/StyledElement';
import { AlignKeyOption, AlignPluginOptionsValues } from './types';

export const ELEMENT_ALIGN_LEFT = 'align_left';
export const ELEMENT_ALIGN_CENTER = 'align_center';
export const ELEMENT_ALIGN_RIGHT = 'align_right';
export const ELEMENT_ALIGN_JUSTIFY = 'align_justify';

export const DEFAULTS_ALIGN: Record<
  AlignKeyOption,
  AlignPluginOptionsValues
> = {
  align_left: {
    component: StyledElement,
    type: ELEMENT_ALIGN_LEFT,
    rootProps: {
      className: 'slate-align-left',
      styles: {
        root: {
          textAlign: 'left',
        },
      },
    },
  },
  align_center: {
    component: StyledElement,
    type: ELEMENT_ALIGN_CENTER,
    rootProps: {
      className: 'slate-align-center',
      styles: {
        root: {
          textAlign: 'center',
        },
      },
    },
  },
  align_right: {
    component: StyledElement,
    type: ELEMENT_ALIGN_RIGHT,
    rootProps: {
      className: 'slate-align-right',
      styles: {
        root: {
          textAlign: 'right',
        },
      },
    },
  },
  align_justify: {
    component: StyledElement,
    type: ELEMENT_ALIGN_JUSTIFY,
    rootProps: {
      className: 'slate-align-justify',
      styles: {
        root: {
          textAlign: 'justify',
        },
      },
    },
  },
};
