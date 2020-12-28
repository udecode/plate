import { getOnHotkeyToggleMarkDefault } from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { DEFAULTS_CODE } from "./defaults";
import { deserializeCode } from "./deserializeCode";
import { renderLeafCode } from "./renderLeafCode";
import { CodePluginOptions } from "./types";

/**
 * Enables support for code formatting
 */
export const CodePlugin = (options?: CodePluginOptions): SlatePlugin => ({
  renderLeaf: renderLeafCode(options),
  deserialize: deserializeCode(options),
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: "code",
    defaultOptions: DEFAULTS_CODE,
    options,
  }),
});
