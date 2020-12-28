import { setDefaults } from "@udecode/slate-plugins-common";
import { Element, Node } from "slate";
import { DEFAULTS_LIST } from "../defaults";
import { ListOptions } from "../types";

export const isNodeTypeList = (
  n: Node,
  options?: ListOptions
): n is Element => {
  const { ul, ol } = setDefaults(options, DEFAULTS_LIST);

  return [ol.type, ul.type].includes(n.type as string);
};
