import { getOnHotkeyToggleMarkDefault } from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { DEFAULTS_SUBSUPSCRIPT } from "../defaults";
import { deserializeSuperscript } from "./deserializeSuperscript";
import { renderLeafSuperscript } from "./renderLeafSuperscript";
import { SuperscriptPluginOptions } from "./types";

/**
 * Enables support for superscript formatting.
 */
export const SuperscriptPlugin = (
  options?: SuperscriptPluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafSuperscript(options),
  deserialize: deserializeSuperscript(options),
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: "superscript",
    defaultOptions: DEFAULTS_SUBSUPSCRIPT,
    options,
  }),
});
