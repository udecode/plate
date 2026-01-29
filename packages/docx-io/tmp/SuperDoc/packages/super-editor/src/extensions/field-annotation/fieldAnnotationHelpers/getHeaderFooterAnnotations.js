import { getAllHeaderFooterEditors } from '@core/helpers/annotator.js';
import { getAllFieldAnnotations } from './index.js';

/**
 * Get all field annotations in the header and footer.
 * @returns {Object[]} An array of field annotations, and which editor they belong to.
 */
export const getHeaderFooterAnnotations = (editor) => {
  const editors = getAllHeaderFooterEditors(editor);

  const allAnnotations = [];
  editors.forEach(({ editor }) => {
    const annotations = getAllFieldAnnotations(editor.state);
    allAnnotations.push(...annotations);
  });
  return allAnnotations;
};
