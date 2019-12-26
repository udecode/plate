export enum HeadingType {
  H1 = 'heading-one',
  H2 = 'heading-two',
  H3 = 'heading-three',
  H4 = 'heading-four',
  H5 = 'heading-five',
  H6 = 'heading-six',
}

export interface RenderElementHeadingOptions {
  levels?: number;
  H1?: any;
  H2?: any;
  H3?: any;
  H4?: any;
  H5?: any;
  H6?: any;
}

export interface DeserializeHeadingOptions {
  levels?: number;
}

export interface HeadingPluginOptions extends RenderElementHeadingOptions {}
