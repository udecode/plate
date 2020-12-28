import {
  ELEMENT_UL,
  getPreventDefaultHandler,
} from "@udecode/slate-plugins-common";
import * as React from "react";
import { useSlate } from "slate-react";
import { ToolbarButtonProps } from "../../../components/ToolbarButton/ToolbarButton.types";
import { ToolbarElement } from "../../../components/ToolbarElement/ToolbarElement";
import { toggleList } from "../transforms/toggleList";

export const ToolbarList = ({
  typeList = ELEMENT_UL,
  ...props
}: ToolbarButtonProps) => {
  const editor = useSlate();

  return (
    <ToolbarElement
      type={typeList}
      onMouseDown={getPreventDefaultHandler(toggleList, editor, {
        ...props,
        typeList,
      })}
      {...props}
    />
  );
};
