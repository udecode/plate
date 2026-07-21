import {
  defineEditorSchema,
  element,
  schema,
  type Editor,
  type SchemaElementInput,
} from '../../src';

let index = 0;

export const defineTestSchema = (
  id: string,
  elements: Readonly<Record<string, SchemaElementInput>>
) => {
  const elementDeclarations = Object.fromEntries(
    Object.entries({
      block: {},
      paragraph: {},
      quote: {},
      ...elements,
    }).map(([type, input]) => [type, element(input)] as const)
  );

  return defineEditorSchema({
    elements: elementDeclarations,
    id,
    root: schema.root({
      content: schema.content.types(Object.keys(elementDeclarations)),
    }),
    unknown: 'preserve',
    version: 1,
  });
};

export const extendTestSchema = (
  editor: Editor,
  elements: Readonly<Record<string, SchemaElementInput>>
) => editor.extend(defineTestSchema(`test-schema-${index++}`, elements));
