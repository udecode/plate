import {
  getAboveByType,
  isNodeTypeIn,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { Editor, Transforms } from "slate";
import { DEFAULTS_TABLE } from "../defaults";
import { TableOptions } from "../types";

export const deleteTable = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const tableItem = getAboveByType(editor, table.type);
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
