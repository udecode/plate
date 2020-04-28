export enum HeadingType {
  H1 = 'heading-one',
  H2 = 'heading-two',
  H3 = 'heading-three',
  H4 = 'heading-four',
  H5 = 'heading-five',
  H6 = 'heading-six',
}

export interface HeadingTypeOptions {
  typeH1?: string;
  typeH2?: string;
  typeH3?: string;
  typeH4?: string;
  typeH5?: string;
  typeH6?: string;
}

export interface DeserializeHeadingOptions extends HeadingTypeOptions {
  levels?: number;
}

export interface RenderElementHeadingOptions extends DeserializeHeadingOptions {
  H1?: any;
  H2?: any;
  H3?: any;
  H4?: any;
  H5?: any;
  H6?: any;
}

export interface HeadingPluginOptions extends RenderElementHeadingOptions {}
