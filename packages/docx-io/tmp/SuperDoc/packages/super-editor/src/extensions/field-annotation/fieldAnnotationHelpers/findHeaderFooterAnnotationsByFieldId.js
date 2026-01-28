import { helpers } from '@core/index.js';
import { getAllHeaderFooterEditors } from '../../../core/helpers/annotator.js';

const { findChildren } = helpers;

/**
 * Find field annotations in headers and footers by field ID or array of field IDs.
 * @param fieldIdOrArray The field ID or array of field IDs.
 * @param editor The editor state.
 * @returns The field annotations array.
 */
export function findHeaderFooterAnnotationsByFieldId(fieldIdOrArray, editor, activeSectionEditor) {
  const sectionEditors = getAllHeaderFooterEditors(editor);
  const annotations = [];
  sectionEditors.forEach(({ editor: sectionEditor }) => {
    const state =
      activeSectionEditor.options.documentId === sectionEditor.options.documentId
        ? activeSectionEditor.state
        : sectionEditor.state;
    const fieldAnnotations = findChildren(state.doc, (node) => {
      let isFieldAnnotation = node.type.name === 'fieldAnnotation';
      if (Array.isArray(fieldIdOrArray)) {
        return isFieldAnnotation && fieldIdOrArray.includes(node.attrs.fieldId);
      } else {
        return isFieldAnnotation && node.attrs.fieldId === fieldIdOrArray;
      }
    });
    annotations.push(...fieldAnnotations);
  });

  return annotations;
}
