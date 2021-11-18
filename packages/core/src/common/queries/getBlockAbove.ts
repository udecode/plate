import {TAncestor} from "../../types/slate/TAncestor";
import {TEditor} from "../../types/slate/TEditor";
import { EditorAboveOptions } from '../types/Editor.types';
import { getAbove } from './getAbove';
  
/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <T extends TAncestor = TAncestor>(
  editor: TEditor,
  options: EditorAboveOptions<T> = {}
) =>
  getAbove<T>(editor, {
    ...options,
    block: true,
  });
