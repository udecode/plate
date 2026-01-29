/**
 * Creates the document to pass to EditorState.
 * @param converter SuperConverter instance.
 * @param schema Schema.
 * @param editor Editor
 * @returns Document.
 */

export function createDocument(converter, schema, editor, { check = false } = {}) {
  const documentData = converter.getSchema(editor);

  if (documentData) {
    const documentNode = schema.nodeFromJSON(documentData);

    // for testing
    if (check) {
      documentNode.check();
    }

    return documentNode;
  }

  return schema.topNodeType.createAndFill();
}
