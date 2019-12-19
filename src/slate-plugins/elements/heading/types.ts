export interface RenderElementHeadingOptions {
  levels: number;
  H1: any;
  H2: any;
  H3: any;
  H4: any;
  H5: any;
  H6: any;
}

export interface HeadingPluginOptions
  extends Partial<RenderElementHeadingOptions> {}
