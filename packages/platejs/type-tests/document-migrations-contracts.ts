import { BaseParagraphPlugin } from '../src';
import {
  type DocumentMigration,
  defineDocumentMigrations,
  migrateDocument,
} from '../src/migrations';

const Schema = { id: 'article', version: 2 } as const;
const migrations = defineDocumentMigrations({
  plugins: [BaseParagraphPlugin],
  schema: Schema,
  sourceFingerprints: { 1: 'fnv1a64:v1' },
  steps: {
    2: ({ document, from, target, to }) => {
      const source: number = from;
      const destination: number = to;

      void source;
      void destination;
      target.schema.fitDocument(document);

      // @ts-expect-error migration inputs are deeply readonly
      document.children = [];
      // @ts-expect-error detached targets do not expose a live editor
      target.editor;

      return { document };
    },
  },
});

const id: 'article' = migrations.id;
const version: 2 = migrations.version;
const step = migrations.steps[2];

void id;
void version;
void step;

defineDocumentMigrations({
  plugins: [BaseParagraphPlugin],
  // @ts-expect-error named schema id is required
  schema: { version: 2 },
  steps: {},
});

defineDocumentMigrations({
  plugins: [BaseParagraphPlugin],
  schema: Schema,
  // @ts-expect-error migration steps must be functions
  steps: { 2: 'invalid' },
});

// @ts-expect-error migration steps return a result object
const bareDocument: DocumentMigration = ({ document }) => document;

void bareDocument;

type V1Document = Readonly<{
  children: [{ children: [{ text: string }]; type: 'paragraph' }];
}>;
type V2Document = Readonly<{
  children: [{ children: [{ text: string }]; type: 'paragraphV2' }];
}>;
type V3Document = Readonly<{
  children: [{ children: [{ text: string }]; type: 'paragraphV3' }];
}>;
type WrongDocument = Readonly<{
  children: [{ children: [{ text: string }]; type: 'wrong' }];
}>;

const typedV2: DocumentMigration<V1Document, V2Document, 1, 2> = ({
  document,
}) => ({
  document: {
    ...document,
    children: [
      {
        children: [{ text: document.children[0].children[0].text }],
        type: 'paragraphV2',
      },
    ],
  },
});
const typedV3: DocumentMigration<V2Document, V3Document, 2, 3> = ({
  document,
}) => ({
  document: {
    ...document,
    children: [
      {
        children: [{ text: document.children[0].children[0].text }],
        type: 'paragraphV3',
      },
    ],
  },
});
const wrongV3: DocumentMigration<WrongDocument, V3Document, 2, 3> = ({
  document,
}) => ({
  document: {
    ...document,
    children: [
      {
        children: [{ text: document.children[0].children[0].text }],
        type: 'paragraphV3',
      },
    ],
  },
});
const wrongSourceV3: DocumentMigration<V2Document, V3Document, 1, 3> = ({
  document,
}) => ({
  document: {
    ...document,
    children: [
      {
        children: [{ text: document.children[0].children[0].text }],
        type: 'paragraphV3',
      },
    ],
  },
});

defineDocumentMigrations({
  plugins: [BaseParagraphPlugin],
  schema: { id: 'article', version: 3 } as const,
  sourceFingerprints: { 1: 'fnv1a64:v1', 2: 'fnv1a64:v2' },
  steps: { 2: typedV2, 3: typedV3 },
});

// @ts-expect-error v3 input must accept the v2 output
defineDocumentMigrations({
  plugins: [BaseParagraphPlugin],
  schema: { id: 'article', version: 3 } as const,
  steps: { 2: typedV2, 3: wrongV3 },
});

// @ts-expect-error v3 must declare v2 as its source version
defineDocumentMigrations({
  plugins: [BaseParagraphPlugin],
  schema: { id: 'article', version: 3 } as const,
  steps: { 2: typedV2, 3: wrongSourceV3 },
});

const raw = { children: [{ children: [{ text: 'current' }], type: 'p' }] };

// @ts-expect-error raw documents require explicit source intent
migrateDocument(raw, { migrations });
migrateDocument(raw, { migrations, source: 1 });
migrateDocument(raw, { migrations, source: 'current' });
// @ts-expect-error source intent is numeric or current
migrateDocument(raw, { migrations, source: 'latest' });
