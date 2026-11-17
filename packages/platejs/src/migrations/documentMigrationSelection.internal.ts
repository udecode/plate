import {
  type Descendant,
  type EditorDocumentValue,
  ElementApi,
  type InternalEditorSchemaApi,
  type Path,
  type Selection,
  SelectionApi,
  TextApi,
} from '../facade';

export const textAt = (children: readonly Descendant[], path: Path) => {
  let node: Descendant | undefined;
  let nodes = children;

  for (const index of path) {
    node = nodes[index];
    if (!node) return undefined;
    nodes = ElementApi.isElement(node) ? node.children : [];
  }

  return node && TextApi.isText(node) ? node : undefined;
};

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
