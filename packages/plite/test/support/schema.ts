import {
  defineEditorExtension,
  type Editor,
  type EditorElementSpec,
} from '../../src';

let index = 0;

export const extendTestSchema = (
  editor: Editor,
  elements: EditorElementSpec | EditorElementSpec[]
) =>
  editor.extend(
    defineEditorExtension({
      elements: Array.isArray(elements) ? elements : [elements],
      name: `test-schema-${index++}`,
    })
  );
