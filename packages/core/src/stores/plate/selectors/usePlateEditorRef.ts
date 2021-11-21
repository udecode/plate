import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const getPlateEditorRef = <T = {}>(id?: string | null) =>
  getPlateState<T>(id)?.editor;

/**
 * Get editor ref which is never updated.
 */
export const usePlateEditorRef = <T = {}>(id?: string | null) =>
  usePlateStore(() => getPlateEditorRef<T>(id));

/**
 * Get plate editor ref updating on plugins change.
 */
export const usePlateEditorWithPlugins = <T = {}>(id?: string | null) => {
  return usePlateStore(() => getPlateEditorRef<T>(id));
};
