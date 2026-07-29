import { toPlatePlugin } from '@platejs/core/react';

import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
} from '../lib';

export const FontBackgroundColorPlugin = toPlatePlugin(
  BaseFontBackgroundColorPlugin
);
export const FontColorPlugin = toPlatePlugin(BaseFontColorPlugin);
export const FontFamilyPlugin = toPlatePlugin(BaseFontFamilyPlugin);
export const FontSizePlugin = toPlatePlugin(BaseFontSizePlugin);
export const FontWeightPlugin = toPlatePlugin(BaseFontWeightPlugin);
export const LineHeightPlugin = toPlatePlugin(BaseLineHeightPlugin);
export const TextAlignPlugin = toPlatePlugin(BaseTextAlignPlugin);
export const TextIndentPlugin = toPlatePlugin(BaseTextIndentPlugin);
