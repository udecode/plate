import { getEditorOptions } from '../utils/getEditorOptions';
import { useTSlateStatic } from './useTSlateStatic';

/**
 * @see {@link getEditorOptions}
 */
export const useEditorOptions = () => {
  return getEditorOptions(useTSlateStatic());
};
