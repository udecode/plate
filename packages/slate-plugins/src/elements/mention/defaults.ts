import { ELEMENT_MENTION } from "@udecode/slate-plugins-common";
import { MentionElement } from "./components/MentionElement";
import { MentionKeyOption, MentionPluginOptionsValues } from "./types";

export const DEFAULTS_MENTION: Record<
  MentionKeyOption,
  MentionPluginOptionsValues
> = {
  mention: {
    component: MentionElement,
    type: ELEMENT_MENTION,
    rootProps: {
      className: "slate-mention",
      prefix: "@",
    },
  },
};
