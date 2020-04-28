export enum HeadingType {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
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
