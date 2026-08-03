import {
  defineEditorSchema,
  schema,
  type Editor,
  type SchemaElementInput,
} from '../../src';

let index = 0;

export const defineTestSchema = (
  id: string,
  elements: Readonly<Record<string, SchemaElementInput>>
) => {
  const inputs: Readonly<Record<string, SchemaElementInput>> = {
    block: {},
    paragraph: {},
    quote: {},
    ...elements,
  };
  const elementDeclarations = Object.fromEntries(
    Object.entries(inputs).map(
      ([type, input]) =>
        [
          type,
          input.content !== undefined ||
          input.void === 'block' ||
          input.void === 'inline' ||
          input.void === 'markable-inline'
            ? input
            : {
                content: input.inline
                  ? schema.content.text()
                  : ['block', 'paragraph', 'quote'].includes(type)
                    ? schema.content.any([
                        schema.content.text(),
                        schema.content.group('inline'),
                      ])
                    : schema.content.open(),
                ...input,
              },
        ] as const
    )
  );

  return defineEditorSchema('schema:derived', {
    elements: elementDeclarations,
    id,
    root: schema.content.types(Object.keys(elementDeclarations)),
    unknown: 'preserve',
    version: 1,
  });
};

export const extendTestSchema = (
  editor: Editor,
  elements: Readonly<Record<string, SchemaElementInput>>
) => editor.install(defineTestSchema(`test-schema-${index++}`, elements));
