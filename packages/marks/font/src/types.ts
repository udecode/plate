import { OverridePropsOptions } from '@udecode/plate-common';

export type FontWeight =
  | 'normal'
  | 'bold'

  /* Keyword values relative to the parent */
  | 'lighter'
  | 'bolder'

  /* Numeric keyword values */
  | 100
  | 200
  | 300
  | 400 // normal
  | 500
  | 600
  | 700 // bold
  | 800
  | 900

  /* Global values */
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset';

export interface FontColorPluginOptions extends OverridePropsOptions<string> {}

export interface FontFamilyPluginOptions extends OverridePropsOptions<string> {}

export interface FontSizePluginOptions
  extends OverridePropsOptions<string | number> {}

export interface FontWeightPluginOptions
  extends OverridePropsOptions<FontWeight> {}
