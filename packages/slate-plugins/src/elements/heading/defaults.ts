import { StyledElement } from '../../components/StyledComponent/StyledElement';
import {
  HeadingKeyOption,
  HeadingLevelsOption,
  HeadingPluginOptionsValues,
} from './types';

export const ELEMENT_H1 = 'h1';
export const ELEMENT_H2 = 'h2';
export const ELEMENT_H3 = 'h3';
export const ELEMENT_H4 = 'h4';
export const ELEMENT_H5 = 'h5';
export const ELEMENT_H6 = 'h6';

const baseMargin = 4.8;
const baseFontSize = 16;

export const DEFAULTS_HEADING: Record<
  HeadingKeyOption,
  HeadingPluginOptionsValues
> &
  Required<HeadingLevelsOption> = {
  h1: {
    component: StyledElement,
    type: ELEMENT_H1,
    rootProps: {
      className: `slate-${ELEMENT_H1}`,
      as: 'h1',
      styles: {
        root: {
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin * 2.5}px`,
          fontSize: `${(baseFontSize * 20) / 11}px`,
          lineHeight: '36px',
          selectors: {
            ':not(:first-child)': { marginTop: '30px' },
          },
        },
      },
    },
  },
  h2: {
    component: StyledElement,
    type: ELEMENT_H2,
    rootProps: {
      className: `slate-${ELEMENT_H2}`,
      as: 'h2',
      styles: {
        root: {
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin * 1.5}px`,
          fontSize: `${(baseFontSize * 16) / 11}px`,
          lineHeight: '28px',
          selectors: {
            ':not(:first-child)': { marginTop: '18px' },
          },
        },
      },
    },
  },
  h3: {
    component: StyledElement,
    type: ELEMENT_H3,
    rootProps: {
      className: `slate-${ELEMENT_H3}`,
      as: 'h3',
      styles: {
        root: {
          color: '#434343',
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin * 1.25}px`,
          fontSize: `${(baseFontSize * 14) / 11}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    },
  },
  h4: {
    component: StyledElement,
    type: ELEMENT_H4,
    rootProps: {
      className: `slate-${ELEMENT_H4}`,
      as: 'h4',
      styles: {
        root: {
          color: '#666666',
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin}px`,
          fontSize: `${(baseFontSize * 12) / 11}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    },
  },
  h5: {
    component: StyledElement,
    type: ELEMENT_H5,
    rootProps: {
      className: `slate-${ELEMENT_H5}`,
      as: 'h5',
      styles: {
        root: {
          color: '#666666',
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin}px`,
          fontSize: `${baseFontSize}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    },
  },
  h6: {
    component: StyledElement,
    type: ELEMENT_H6,
    rootProps: {
      className: `slate-${ELEMENT_H6}`,
      as: 'h6',
      styles: {
        root: {
          color: '#666666',
          fontWeight: '400',
          fontStyle: 'italic',
          marginTop: 0,
          marginBottom: `${baseMargin}px`,
          fontSize: `${baseFontSize}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    },
  },
  levels: 6,
};
