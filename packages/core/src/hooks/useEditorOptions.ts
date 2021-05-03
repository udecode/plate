import { getEditorOptions } from '../utils/getEditorOptions';
import { useEditorRef } from './useEditorRef';

/**
 * @see {@link getEditorOptions}
 */
export const useEditorOptions = () => {
  return getEditorOptions(useEditorRef());
};
