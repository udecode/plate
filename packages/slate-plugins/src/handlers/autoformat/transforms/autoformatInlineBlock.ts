import { getRangeBefore } from "@udecode/slate-plugins-common";
import { Editor, Range } from "slate";
import { AutoformatRule } from "../types";
import { autoformatBlock } from "./autoformatBlock";

/**
 * Autoformat in the middle of a block
 */
export const autoformatInlineBlock = (
  editor: Editor,
  {
    type,
    markup,
    preFormat,
    format,
  }: Pick<AutoformatRule, "type" | "markup" | "preFormat" | "format">
) => {
  const markupRange = getRangeBefore(editor, editor.selection as Range, {
    matchString: markup,
    skipInvalid: true,
  });

  if (markupRange) {
    autoformatBlock(editor, type, markupRange, {
      preFormat: () => {
        editor.insertBreak();
        preFormat?.(editor);
      },
      format,
    });

    return true;
  }
};
