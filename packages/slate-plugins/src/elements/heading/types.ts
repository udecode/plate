import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export enum HeadingType {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}

// Data of Element node
export interface HeadingNodeData {}

// Element node
export interface HeadingNode extends Element, HeadingNodeData {}

// Type option
interface TypeOption {
  typeH1?: string;
  typeH2?: string;
  typeH3?: string;
  typeH4?: string;
  typeH5?: string;
  typeH6?: string;
}

interface LevelsOption {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: number;
}

// deserialize options
export interface HeadingDeserializeOptions extends TypeOption, LevelsOption {}

// renderElement options given as props
interface HeadingRenderElementOptionsProps {}

// renderElement options
export interface HeadingRenderElementOptions
  extends RenderElementOptions,
    HeadingRenderElementOptionsProps,
    TypeOption,
    LevelsOption {
  H1?: any;
  H2?: any;
  H3?: any;
  H4?: any;
  H5?: any;
  H6?: any;
  fontSize?: number;
}

// renderElement props
export interface HeadingRenderElementProps
  extends RenderElementProps,
    HeadingRenderElementOptionsProps {
  element: HeadingNode;
}

// Plugin options
export interface HeadingPluginOptions
  extends HeadingRenderElementOptions,
    HeadingDeserializeOptions {}
