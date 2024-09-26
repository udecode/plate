import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from '../lib';

export const FontColorPlugin = toPlatePlugin(BaseFontColorPlugin);

export const FontSizePlugin = toPlatePlugin(BaseFontSizePlugin);

export const FontFamilyPlugin = toPlatePlugin(BaseFontFamilyPlugin);

export const FontBackgroundColorPlugin = toPlatePlugin(
  BaseFontBackgroundColorPlugin
);

export const FontWeightPlugin = toPlatePlugin(BaseFontWeightPlugin);
