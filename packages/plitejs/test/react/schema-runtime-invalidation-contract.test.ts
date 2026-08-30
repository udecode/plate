import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  property,
  schema,
  target,
} from 'plitejs';
import { expect, test } from 'vitest';

import { getEditorRuntimeElementEntries, getNodeKey } from '../../src/internal';
import { getSchemaInvalidatedNodeKeys } from '../../src/react/editable/schema-runtime-invalidation';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const heading = (text: string) => ({
  children: [{ text }],
  type: 'heading',
});

const articleSchema = (version: number, paragraphReadOnly: boolean) =>
  defineEditorSchema('schema:react-schema-runtime-invalidation', {
    elements: {
      heading: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
        readOnly: paragraphReadOnly,
      },
    },
    id: 'react-schema-runtime-invalidation',
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version,
  });

test('schema invalidation targets node keys of changed element types', () => {
  const slot = defineExtensionSlot('react-schema-runtime-invalidation');
  const editor = createEditor({
    extensions: [slot.of(articleSchema(1, false))],
    initialValue: [paragraph('body'), heading('title')],
  });
  const paragraphNodeKey = getNodeKey(editor, [0]);
  const headingNodeKey = getNodeKey(editor, [1]);

  editor.update.extensions.reconfigure(slot, articleSchema(2, true));

  const commit = editor.read.lastCommit();

  if (!commit || !paragraphNodeKey || !headingNodeKey) {
    throw new Error('Expected committed node keys');
  }

  expect(getSchemaInvalidatedNodeKeys(editor, commit)).toEqual([
    paragraphNodeKey,
  ]);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).not.toContain(
    headingNodeKey
  );
});

const projectedSchema = (version: number, paragraphReadOnly: boolean) =>
  defineEditorSchema('schema:react-projected-schema-runtime-invalidation', {
    elements: {
      'content-card': {
        content: schema.content.open(),
        contentRoots: { body: schema.content.type('paragraph') },
        void: 'editable-island',
      },
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
        readOnly: paragraphReadOnly,
      },
    },
    id: 'react-projected-schema-runtime-invalidation',
    root: schema.content.type('content-card'),
    unknown: 'preserve',
    version,
  });

test('schema invalidation includes node keys in projected roots', () => {
  const slot = defineExtensionSlot(
    'react-projected-schema-runtime-invalidation'
  );
  const editor = createEditor({
    extensions: [slot.of(projectedSchema(1, false))],
    initialValue: {
      children: [
        {
          childRoots: { body: 'card:body' },
          children: [{ text: '' }],
          type: 'content-card',
        },
      ],
      roots: { 'card:body': [paragraph('body')] },
    },
  });
  const [projectedParagraph] = getEditorRuntimeElementEntries(
    editor,
    ['paragraph'],
    'card:body'
  );

  editor.update.extensions.reconfigure(slot, projectedSchema(2, true));

  const commit = editor.read.lastCommit();

  if (!commit || !projectedParagraph) {
    throw new Error('Expected projected node key and commit');
  }

  expect(getSchemaInvalidatedNodeKeys(editor, commit)).toEqual([
    projectedParagraph.nodeKey,
  ]);
});

const propertySchema = (
  version: number,
  elementSplit: 'drop' | 'preserve',
  textInclusive: boolean
) =>
  defineEditorSchema('schema:react-schema-property-invalidation', {
    elements: {
      heading: { content: schema.content.text() },
      paragraph: { content: schema.content.text() },
    },
    id: 'react-schema-property-invalidation',
    properties: [
      schema.elementProperty('align', property.string(), {
        split: elementSplit,
        target: target.type('paragraph'),
      }),
      schema.textProperty('tone', property.string(), {
        inclusive: textInclusive,
        target: target.type('paragraph'),
      }),
    ],
    root: schema.content.types(['heading', 'paragraph']),
    unknown: 'reject',
    version,
  });

test('schema invalidation targets element-property applicability without widening', () => {
  const slot = defineExtensionSlot('react-schema-element-property');
  const editor = createEditor({
    extensions: [slot.of(propertySchema(1, 'preserve', true))],
    initialValue: [paragraph('body'), heading('title')],
  });
  const paragraphNodeKey = getNodeKey(editor, [0]);
  const headingNodeKey = getNodeKey(editor, [1]);

  editor.update.extensions.reconfigure(slot, propertySchema(2, 'drop', true));
  const commit = editor.read.lastCommit();

  if (!commit || !paragraphNodeKey || !headingNodeKey) {
    throw new Error('Expected property publication node keys');
  }

  expect(editor.read.schema.delta()?.elementTypes).toEqual(['paragraph']);
  expect(editor.read.schema.delta()?.propertyIds).toHaveLength(1);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).toEqual([
    paragraphNodeKey,
  ]);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).not.toContain(
    headingNodeKey
  );
});

test('schema invalidation targets text-property parent elements', () => {
  const slot = defineExtensionSlot('react-schema-text-property');
  const editor = createEditor({
    extensions: [slot.of(propertySchema(1, 'preserve', true))],
    initialValue: [paragraph('body'), heading('title')],
  });
  const paragraphNodeKey = getNodeKey(editor, [0]);
  const headingNodeKey = getNodeKey(editor, [1]);

  editor.update.extensions.reconfigure(
    slot,
    propertySchema(2, 'preserve', false)
  );
  const commit = editor.read.lastCommit();

  if (!commit || !paragraphNodeKey || !headingNodeKey) {
    throw new Error('Expected text-property publication node keys');
  }

  expect(editor.read.schema.delta()?.elementTypes).toEqual(['paragraph']);
  expect(editor.read.schema.delta()?.propertyIds).toHaveLength(1);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).toEqual([
    paragraphNodeKey,
  ]);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).not.toContain(
    headingNodeKey
  );
});

const constructionPropertySchema = (version: number, defaultAlign: string) =>
  defineEditorSchema('schema:react-schema-construction-property-invalidation', {
    elements: {
      paragraph: { content: schema.content.text() },
    },
    id: 'react-schema-construction-property-invalidation',
    properties: [
      schema.elementProperty(
        'align',
        property.string({ default: defaultAlign }),
        { target: target.type('paragraph') }
      ),
    ],
    root: schema.content.type('paragraph'),
    unknown: 'reject',
    version,
  });

test('property defaults invalidate affected construction types', () => {
  const slot = defineExtensionSlot('react-schema-construction-property');
  const editor = createEditor({
    extensions: [slot.of(constructionPropertySchema(1, 'left'))],
    initialValue: [{ ...paragraph('body'), align: 'left' }],
  });

  editor.update.extensions.reconfigure(
    slot,
    constructionPropertySchema(2, 'right'),
    {
      migrate: ({ document, next }) => next.fitDocument(document),
    }
  );

  expect(editor.read.schema.delta()?.constructionTypes).toEqual(['paragraph']);
  expect(editor.read.schema.delta()?.elementTypes).toEqual(['paragraph']);
  expect(editor.read.schema.delta()?.propertyIds).toHaveLength(1);
});

const rootedSchema = (version: number, mainMax: number, notesMax: number) =>
  defineEditorSchema('schema:react-schema-root-invalidation', {
    elements: {
      heading: { content: schema.content.text() },
      paragraph: { content: schema.content.text() },
    },
    id: 'react-schema-root-invalidation',
    root: schema.content.types(['heading', 'paragraph'], { max: mainMax }),
    roots: {
      notes: schema.content.types(['heading', 'paragraph'], {
        max: notesMax,
      }),
    },
    unknown: 'reject',
    version,
  });

test('schema invalidation targets only top-level elements in a changed main root', () => {
  const slot = defineExtensionSlot('react-schema-main-root');
  const editor = createEditor({
    extensions: [slot.of(rootedSchema(1, 3, 3))],
    initialValue: {
      children: [paragraph('body'), heading('title')],
      roots: { notes: [heading('note'), paragraph('detail')] },
    },
  });
  const mainNodeKeys = [getNodeKey(editor, [0]), getNodeKey(editor, [1])];
  const namedNodeKeys = getEditorRuntimeElementEntries(
    editor,
    ['heading', 'paragraph'],
    'notes'
  ).map((entry) => entry.nodeKey);

  editor.update.extensions.reconfigure(slot, rootedSchema(2, 2, 3));
  const commit = editor.read.lastCommit();

  if (!commit || mainNodeKeys.some((nodeKey) => !nodeKey)) {
    throw new Error('Expected main-root node keys');
  }

  expect(editor.read.schema.delta()?.roots).toEqual([null]);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).toEqual(mainNodeKeys);
  for (const nodeKey of namedNodeKeys) {
    expect(getSchemaInvalidatedNodeKeys(editor, commit)).not.toContain(nodeKey);
  }
});

test('schema invalidation isolates a changed named root', () => {
  const slot = defineExtensionSlot('react-schema-named-root');
  const editor = createEditor({
    extensions: [slot.of(rootedSchema(1, 3, 3))],
    initialValue: {
      children: [paragraph('body'), heading('title')],
      roots: { notes: [heading('note'), paragraph('detail')] },
    },
  });
  const mainNodeKeys = [getNodeKey(editor, [0]), getNodeKey(editor, [1])];
  const namedNodeKeys = getEditorRuntimeElementEntries(
    editor,
    ['heading', 'paragraph'],
    'notes'
  ).map((entry) => entry.nodeKey);

  editor.update.extensions.reconfigure(slot, rootedSchema(2, 3, 2));
  const commit = editor.read.lastCommit();

  if (!commit || mainNodeKeys.some((nodeKey) => !nodeKey)) {
    throw new Error('Expected named-root node keys');
  }

  expect(editor.read.schema.delta()?.roots).toEqual(['notes']);
  expect(getSchemaInvalidatedNodeKeys(editor, commit)).toEqual(namedNodeKeys);
  for (const nodeKey of mainNodeKeys) {
    expect(getSchemaInvalidatedNodeKeys(editor, commit)).not.toContain(nodeKey);
  }
});
