import {
  defineEditorSchema,
  property,
  schema,
  target,
  type EditorDocumentValue,
  type SchemaElement,
  type SchemaProperty,
} from '../../../packages/plite/src/index';

export const SCHEMA_ARCHITECTURE_CORPUS = Object.freeze({
  declaredGroups: 30,
  elementTypes: 100,
  exactElementProperties: 100,
  exactTextProperties: 100,
  namedRoots: 3,
  prefixElementProperties: 10,
  prefixTextProperties: 10,
  roots: 4,
});

export const schemaElementType = (index: number) => `element_${index}`;
export const schemaElementPropertyKey = (index: number) =>
  `element_exact_${index}`;
export const schemaTextPropertyKey = (index: number) => `text_exact_${index}`;
export const schemaGroupName = (index: number) =>
  `group_${index % SCHEMA_ARCHITECTURE_CORPUS.declaredGroups}`;
export const schemaElementPrefix = (index: number) =>
  `element_namespace_${index}:`;
export const schemaTextPrefix = (index: number) => `text_namespace_${index}:`;

export const createSchemaArchitectureCorpus = () => {
  const elements: Record<string, SchemaElement> = Object.fromEntries(
    Array.from(
      { length: SCHEMA_ARCHITECTURE_CORPUS.elementTypes },
      (_value, index) => [
        schemaElementType(index),
        {
          content:
            index < SCHEMA_ARCHITECTURE_CORPUS.elementTypes / 2
              ? schema.content.group('block')
              : schema.content.text(),
          groups: [schemaGroupName(index)],
          properties: {
            [schemaElementPropertyKey(index)]: property.number({
              default: index,
              omitDefault: true,
            }),
          },
        },
      ]
    )
  );
  const exactTextProperties: SchemaProperty[] = Array.from(
    { length: SCHEMA_ARCHITECTURE_CORPUS.exactTextProperties },
    (_value, index) =>
      schema.textProperty(schemaTextPropertyKey(index), property.string(), {
        target: target.type(schemaElementType(index)),
      })
  );
  const elementPrefixes: SchemaProperty[] = Array.from(
    { length: SCHEMA_ARCHITECTURE_CORPUS.prefixElementProperties },
    (_value, index) =>
      schema.elementProperty(
        schema.key.prefix(schemaElementPrefix(index)),
        property.json(),
        { target: target.type(schemaElementType(index)) }
      )
  );
  const textPrefixes: SchemaProperty[] = Array.from(
    { length: SCHEMA_ARCHITECTURE_CORPUS.prefixTextProperties },
    (_value, index) =>
      schema.textProperty(
        schema.key.prefix(schemaTextPrefix(index)),
        property.json(),
        { target: target.type(schemaElementType(index)) }
      )
  );

  return defineEditorSchema({
    elements,
    groups: Object.fromEntries(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.declaredGroups },
        (_value, index) => [schemaGroupName(index), {}]
      )
    ),
    id: 'schema-architecture-benchmark',
    properties: [...exactTextProperties, ...elementPrefixes, ...textPrefixes],
    root: {
      content: schema.content.group('block', {
        default: { type: schemaElementType(0) },
        min: 1,
      }),
    },
    roots: Object.fromEntries(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.namedRoots },
        (_value, index) => [
          `aux_${index + 1}`,
          {
            content: schema.content.group('block', {
              default: { type: schemaElementType(index + 1) },
              min: 1,
            }),
          },
        ]
      )
    ),
    unknown: 'reject',
    version: 1,
  });
};

export const createSchemaArchitectureValue = (): EditorDocumentValue => {
  const leaf = (index: number) => ({
    children: [{ text: `root-${index}` }],
    type: schemaElementType(
      SCHEMA_ARCHITECTURE_CORPUS.elementTypes / 2 + index
    ),
  });

  return {
    children: [leaf(0)],
    roots: Object.fromEntries(
      Array.from(
        { length: SCHEMA_ARCHITECTURE_CORPUS.namedRoots },
        (_value, index) => [`aux_${index + 1}`, [leaf(index + 1)]]
      )
    ),
  };
};
