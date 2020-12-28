import { getNodesById } from "@udecode/slate-plugins-common";
import { Editor } from "slate";

/**
 * Get block path by id.
 */
export const getBlockPathById = (editor: Editor, id: string) => {
  const nodeEntries = getNodesById(editor, id);
  if (!nodeEntries.length) return;
  const [, path] = nodeEntries[0];
  return path;
};
