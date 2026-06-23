import { defineEditorExtension, type Editor, type Element } from '../../src';

let index = 0;

export const extendTestSchema = (
  editor: Editor,
  elements: Element | Element[]
) =>
  editor.extend(
    defineEditorExtension({
      elements: Array.isArray(elements) ? elements : [elements],
      name: `test-schema-${index++}`,
    })
  );
