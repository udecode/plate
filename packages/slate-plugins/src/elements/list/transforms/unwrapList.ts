import { setDefaults, unwrapNodesByType } from "@udecode/slate-plugins-common";
import { Editor } from "slate";
import { DEFAULTS_LIST } from "../defaults";
import { ListOptions } from "../types";

export const unwrapList = (editor: Editor, options?: ListOptions) => {
  const { li, ul, ol } = setDefaults(options, DEFAULTS_LIST);

  unwrapNodesByType(editor, li.type);
  unwrapNodesByType(editor, [ul.type, ol.type], { split: true });
};
