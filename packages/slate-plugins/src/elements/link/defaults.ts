import { ELEMENT_LINK, isUrl } from "@udecode/slate-plugins-common";
import { LinkElement } from "./components/LinkElement";
import { LinkKeyOption, LinkPluginOptionsValues } from "./types";

export const DEFAULTS_LINK: Record<LinkKeyOption, LinkPluginOptionsValues> = {
  link: {
    component: LinkElement,
    type: ELEMENT_LINK,
    isUrl,
    rootProps: {
      className: "slate-link",
    },
  },
};
