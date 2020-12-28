import { getOnHotkeyToggleMarkDefault } from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { DEFAULTS_ITALIC } from "./defaults";
import { deserializeItalic } from "./deserializeItalic";
import { renderLeafItalic } from "./renderLeafItalic";
import { ItalicPluginOptions } from "./types";

/**
 * Enables support for italic formatting.
 */
export const ItalicPlugin = (options?: ItalicPluginOptions): SlatePlugin => ({
  renderLeaf: renderLeafItalic(options),
  deserialize: deserializeItalic(options),
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: "italic",
    defaultOptions: DEFAULTS_ITALIC,
    options,
  }),
});
