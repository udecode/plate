import { MARK_PRISM } from "@udecode/slate-plugins-common";
import { RenderLeaf } from "@udecode/slate-plugins-core";
import * as React from "react";

export const renderLeafCodeBlock = (): RenderLeaf => ({ leaf, children }) => {
  if (leaf[MARK_PRISM] && !!leaf.text) {
    return <span className={leaf?.className as string}>{children}</span>;
  }
  return children;
};
