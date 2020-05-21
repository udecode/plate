import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export enum HeadingType {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}

export interface HeadingNodeData {
  [key: string]: unknown;
}

// Node
export interface HeadingNode extends Element, HeadingNodeData {}

// Option type
interface TypeOption {
  typeH1?: string;
  typeH2?: string;
  typeH3?: string;
  typeH4?: string;
  typeH5?: string;
  typeH6?: string;
}

interface OptionLevels {
  levels?: number;
}

// deserialize options
export interface HeadingDeserializeOptions extends TypeOption, OptionLevels {}

// renderElement options given as props
interface HeadingRenderElementOptionsProps {}

// renderElement options
export interface HeadingRenderElementOptions
  extends RenderElementOptions,
    HeadingRenderElementOptionsProps,
    TypeOption,
    OptionLevels {
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
