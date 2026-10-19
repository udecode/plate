import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
} from '../../../features/basic-styles/lib';
import { toReactPlugin } from '../../core';

export const FontBackgroundColorPlugin = toReactPlugin(
  BaseFontBackgroundColorPlugin
);
export const FontColorPlugin = toReactPlugin(BaseFontColorPlugin);
export const FontFamilyPlugin = toReactPlugin(BaseFontFamilyPlugin);
export const FontSizePlugin = toReactPlugin(BaseFontSizePlugin);
export const FontWeightPlugin = toReactPlugin(BaseFontWeightPlugin);
export const LineHeightPlugin = toReactPlugin(BaseLineHeightPlugin);
export const TextAlignPlugin = toReactPlugin(BaseTextAlignPlugin);
export const TextIndentPlugin = toReactPlugin(BaseTextIndentPlugin);
