import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFormattingPlugin,
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../../../features/basic-styles/lib';
import { toReactPlugin } from '../../core';

export const FontBackgroundColorPlugin = toReactPlugin(
  BaseFontBackgroundColorPlugin
);
export const FontColorPlugin = toReactPlugin(BaseFontColorPlugin);
export const FontFamilyPlugin = toReactPlugin(BaseFontFamilyPlugin);
export const FontSizePlugin = toReactPlugin(BaseFontSizePlugin);
export const LineHeightPlugin = toReactPlugin(BaseLineHeightPlugin);
export const TextAlignPlugin = toReactPlugin(BaseTextAlignPlugin);

/** Clear formatting in React editors, bound to `Mod+\`. */
export const FormattingPlugin = toReactPlugin(BaseFormattingPlugin, {
  shortcuts: { clear: { keys: ['mod+\\', 'mod+backslash'] } },
});
