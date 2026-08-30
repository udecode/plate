import { type DocumentMigration, defineDocumentMigrations } from '../src';

const Schema = { id: 'article', version: 2 } as const;
const migrateV2 = (({ document, from, to }) => {
  const source: number = from;
  const target: number = to;

  void source;
  void target;

  return document;
}) satisfies DocumentMigration;

const migrations = defineDocumentMigrations(Schema, {
  sourceFingerprints: { 1: 'fnv1a64:v1' },
  steps: { 2: migrateV2 },
  unversioned: 1,
});

const id: 'article' = migrations.id;
const version: 2 = migrations.version;
const step = migrations.steps[2];

void id;
void version;
void step;

// @ts-expect-error named schema id is required
defineDocumentMigrations({ version: 2 }, { steps: { 2: migrateV2 } });

// @ts-expect-error migration steps must be functions
defineDocumentMigrations(Schema, { steps: { 2: 'invalid' } });

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
  ...document,
  children: [{ ...document.children[0], type: 'paragraphV2' }],
});
const typedV3: DocumentMigration<V2Document, V3Document, 2, 3> = ({
  document,
}) => ({
  ...document,
  children: [{ ...document.children[0], type: 'paragraphV3' }],
});
const wrongV3: DocumentMigration<WrongDocument, V3Document, 2, 3> = ({
  document,
}) => ({
  ...document,
  children: [{ ...document.children[0], type: 'paragraphV3' }],
});
const wrongSourceV3: DocumentMigration<V2Document, V3Document, 1, 3> = ({
  document,
}) => ({
  ...document,
  children: [{ ...document.children[0], type: 'paragraphV3' }],
});

defineDocumentMigrations({ id: 'article', version: 3 } as const, {
  steps: { 2: typedV2, 3: typedV3 },
  unversioned: 1,
});

// @ts-expect-error v3 input must accept the v2 output
defineDocumentMigrations({ id: 'article', version: 3 } as const, {
  steps: { 2: typedV2, 3: wrongV3 },
  unversioned: 1,
});

// @ts-expect-error v3 must declare v2 as its source version
defineDocumentMigrations({ id: 'article', version: 3 } as const, {
  steps: { 2: typedV2, 3: wrongSourceV3 },
  unversioned: 1,
});
