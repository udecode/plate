import { Editor } from "slate";
import { getNodesById } from "../..";

/**
 * @temp This is copied from  "packages/slate-plugins/src/dnd/utils/getBlockPathById.ts"
 */

/**
 * Get block path by id.
 */
export const getBlockPathById = (editor: Editor, id: string) => {
  const nodeEntries = getNodesById(editor, id);
  if (!nodeEntries.length) return;
  const [, path] = nodeEntries[0];
  return path;
};
