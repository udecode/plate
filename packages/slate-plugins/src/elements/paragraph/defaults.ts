import { ELEMENT_PARAGRAPH } from "@udecode/slate-plugins-common";
import { StyledElement } from "../../components/StyledComponent/StyledElement";
import { ParagraphKeyOption, ParagraphPluginOptionsValues } from "./types";

export const DEFAULTS_PARAGRAPH: Record<
  ParagraphKeyOption,
  ParagraphPluginOptionsValues
> = {
  p: {
    component: StyledElement,
    type: ELEMENT_PARAGRAPH,
    hotkey: ["mod+opt+0", "mod+shift+0"],
    rootProps: {
      className: `slate-${ELEMENT_PARAGRAPH}`,
      as: "p",
    },
  },
};
