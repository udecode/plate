import {TEditor} from "../../types/slate/TEditor";
import { isExpanded } from './isExpanded';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = (editor: TEditor) =>
  isExpanded(editor.selection);
