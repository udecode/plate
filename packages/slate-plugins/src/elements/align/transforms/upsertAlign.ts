import { unwrapNodesByType, wrapNodes } from "@udecode/slate-plugins-common";
import { Editor } from "slate";
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
} from "../defaults";

export const upsertAlign = (
  editor: Editor,
  {
    type,
    unwrapTypes = [
      ELEMENT_ALIGN_LEFT,
      ELEMENT_ALIGN_CENTER,
      ELEMENT_ALIGN_RIGHT,
    ],
  }: { type?: string; unwrapTypes?: string[] }
) => {
  if (!editor.selection) return;

  unwrapNodesByType(editor, unwrapTypes);

  if (!type) return;

  wrapNodes(
    editor,
    {
      type,
      children: [],
    },
    { mode: "lowest" }
  );
};
