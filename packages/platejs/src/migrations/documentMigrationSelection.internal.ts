import {
  type EditorDocumentValue,
  type InternalEditorSchemaApi,
  type Selection,
  SelectionApi,
} from '../facade';

export const historicalSelectionGeometry = (
  selection: Exclude<Selection, null>
): Exclude<Selection, null> => {
  if (!SelectionApi.isText(selection) || selection.marks === undefined) {
    return selection;
  }
  const { marks: _marks, ...geometry } = selection;

  return geometry;
};

export const landSelectionMarks = (
  schema: InternalEditorSchemaApi,
  selection: Selection,
  marks: Readonly<Record<string, unknown>> | undefined,
  value: EditorDocumentValue
): Selection =>
  marks === undefined || !selection || !SelectionApi.isText(selection)
    ? selection
    : Object.freeze({
        ...selection,
        marks: schema.landTextPropertiesAt(marks, {
          path: selection.focus.path,
          root: SelectionApi.root(selection) ?? 'main',
          value,
        }),
      });
