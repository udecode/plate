import { toPlatePlugin } from '@udecode/plate/react';

import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHeadingPlugin,
} from '../lib/BaseHeadingPlugin';

export const HeadingPlugin = toPlatePlugin(BaseHeadingPlugin);

export const H1Plugin = toPlatePlugin(BaseH1Plugin);
export const H2Plugin = toPlatePlugin(BaseH2Plugin);
export const H3Plugin = toPlatePlugin(BaseH3Plugin);
export const H4Plugin = toPlatePlugin(BaseH4Plugin);
export const H5Plugin = toPlatePlugin(BaseH5Plugin);
export const H6Plugin = toPlatePlugin(BaseH6Plugin);
