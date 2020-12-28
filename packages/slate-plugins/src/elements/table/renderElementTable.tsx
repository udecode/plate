import { getRenderElements, setDefaults } from "@udecode/slate-plugins-common";
import { DEFAULTS_TABLE } from "./defaults";
import { TableRenderElementOptions } from "./types";

export const renderElementTable = (options?: TableRenderElementOptions) => {
  const { table, td, th, tr } = setDefaults(options, DEFAULTS_TABLE);

  return getRenderElements([table, th, tr, td]);
};
