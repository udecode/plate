import { OverridePropsOptions } from '@udecode/plate-common';

export type Alignment = 'left' | 'center' | 'right' | 'justify';

export interface AlignPluginOptions extends OverridePropsOptions<Alignment> {}
