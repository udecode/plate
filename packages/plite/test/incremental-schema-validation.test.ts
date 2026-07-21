import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  createEditor,
  defineEditorSchema,
  definePropertyPolicy,
  DocumentChange,
  type EditorDocumentValue,
  type Element,
  element,
  NodeApi,
  property,
  schema,
  target,
} from '@platejs/plite';

import {
  DocumentChangeBuilder,
  type JsonEditorValue,
} from '../src/core/document-change';
import { getEditorSchema } from '../src/core/editor-runtime';

const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});
const paragraphWithText = (
  text: string,
  properties: Readonly<Record<string, unknown>> = {}
): Element => ({
  children: [{ ...properties, text }],
  type: 'paragraph',
});
const section = (children: Element[]): Element => ({
  children,
  type: 'section',
});
const createValidationEditor = () =>
  createEditor({
    extensions: [
      defineEditorSchema({
        elements: {
          heading: element({
            content: schema.content.text({ default: 'text', min: 1 }),
          }),
          paragraph: element({
            content: schema.content.text({
              default: 'text',
              max: 2,
              min: 1,
            }),
            groups: ['block'],
          }),
          section: element({
            content: schema.content.group('block', {
              default: { type: 'paragraph' },
              max: 3,
              min: 1,
            }),
          }),
        },
        id: 'incremental-validation-laws',
        properties: [
          schema.textProperty('bold', property.boolean(), {
            target: { kind: 'type', type: 'paragraph' },
          }),
        ],
        root: schema.root({
          content: schema.content.types(['paragraph', 'section'], {
            default: { type: 'paragraph' },
            max: 3,
            min: 1,
          }),
        }),
        roots: {
          header: schema.root({
            content: schema.content.type('heading', {
              default: { type: 'heading' },
              min: 1,
            }),
          }),
        },
        version: 1,
      }),
    ],
    initialValue: {
      children: [section([paragraph('alpha'), paragraph('beta')])],
      roots: {
        header: [{ children: [{ text: 'title' }], type: 'heading' }],
      },
    },
  });

const errorMessage = (run: () => void) => {
  try {
    run();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

const isEditorDocumentValue = (
  value: JsonEditorValue
): value is JsonEditorValue & EditorDocumentValue =>
  value.children.every(NodeApi.isDescendant) &&
  Object.values(value.roots ?? {}).every((children) =>
    children.every(NodeApi.isDescendant)
  );

const freezeDocument = (value: EditorDocumentValue) => {
  const freezeNode = (node: Element | { text: string }) => {
    if (NodeApi.isElement(node)) {
      for (const child of node.children) freezeNode(child);
      Object.freeze(node.children);
    }
    Object.freeze(node);
  };

  for (const child of value.children) freezeNode(child);
  Object.freeze(value.children);
  for (const children of Object.values(value.roots ?? {})) {
    for (const child of children) freezeNode(child);
    Object.freeze(children);
  }
  if (value.roots) Object.freeze(value.roots);
  Object.freeze(value);
};

const validateWithBuilder = (
  before: JsonEditorValue,
  change: DocumentChange,
  validate: ReturnType<typeof getEditorSchema>['validateDocumentChange']
) => {
  const builder = new DocumentChangeBuilder(before, {
    validateConstructed: (input) => {
      if (
        !isEditorDocumentValue(input.after) ||
        !isEditorDocumentValue(input.before)
      ) {
        throw new Error('Constructed test document is not an editor value.');
      }

      validate({
        ...input,
        after: input.after,
        before: input.before,
      });
    },
  });

  builder.apply(change);
  builder.finalize();
};

describe('incremental schema validation', () => {
  it('validates each changed node property once per transaction', () => {
    type Trace = Readonly<{
      kind: 'element' | 'text';
    }>;
    const visits = { element: 0, text: 0 };
    const policy = definePropertyPolicy<Trace>({
      id: 'incremental-validation-locality',
      validate: (value): value is Trace => {
        if (
          typeof value !== 'object' ||
          value === null ||
          !('kind' in value) ||
          (value.kind !== 'element' && value.kind !== 'text')
        ) {
          return false;
        }

        visits[value.kind] += 1;

        return true;
      },
      version: 1,
    });
    const descriptor = property.json<Trace>({ policy });
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            paragraph: element({
              content: schema.content.text(),
              properties: { trace: descriptor },
            }),
          },
          id: 'incremental-validation-locality',
          properties: [
            schema.textProperty('trace', descriptor, {
              target: target.type('paragraph'),
            }),
          ],
          root: schema.root({
            content: schema.content.type('paragraph', { min: 1 }),
          }),
          version: 1,
        }),
      ],
      initialValue: {
        children: [
          {
            children: [{ text: 'x', trace: { kind: 'text' } }],
            trace: { kind: 'element' },
            type: 'paragraph',
          },
        ],
      },
    });

    visits.element = 0;
    visits.text = 0;

    editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 1, path: [0, 0] } })
    );

    assert.deepEqual(visits, { element: 1, text: 1 });
  });

  it('prunes descendant validation without confusing sibling path prefixes', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            paragraph: element({
              content: schema.content.text({ default: 'text', min: 1 }),
            }),
          },
          id: 'incremental-validation-siblings',
          properties: [
            schema.textProperty('bold', property.boolean(), {
              target: { kind: 'type', type: 'paragraph' },
            }),
          ],
          root: schema.root({
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          }),
          version: 1,
        }),
      ],
      initialValue: { children: [paragraph('seed')] },
    });
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const children = Array.from({ length: 512 }, (_, index) =>
      paragraphWithText(`sibling-${index}`, {
        bold: index === 511 ? 'invalid' : true,
      })
    );
    const change = DocumentChange.between(before, { children });
    const after = change.apply(before);
    const full = errorMessage(() => schemaApi.validateDocument(after));
    const incremental = errorMessage(() =>
      validateWithBuilder(before, change, schemaApi.validateDocumentChange)
    );

    assert.match(full ?? '', /boolean/i);
    assert.equal(incremental, full);
  });

  it('matches full validation for changed descendants, ancestors, and roots', () => {
    const editor = createValidationEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();

    schemaApi.validateDocument(before);

    const candidates: EditorDocumentValue[] = [
      {
        ...before,
        children: [section([paragraph('changed'), paragraph('beta')])],
      },
      {
        ...before,
        children: [],
      },
      {
        ...before,
        children: [section([])],
      },
      {
        ...before,
        children: [
          {
            children: [paragraph('nested')],
            type: 'paragraph',
          },
        ],
      },
      {
        ...before,
        children: [
          section([{ children: [{ text: 'unknown' }], type: 'unknown' }]),
        ],
      },
      {
        ...before,
        children: [section([paragraphWithText('invalid', { bold: 'yes' })])],
      },
      {
        ...before,
        roots: {
          ...before.roots,
          header: [],
        },
      },
      {
        ...before,
        children: [
          section([
            paragraph('alpha'),
            paragraph('beta'),
            paragraph('gamma'),
            paragraph('overflow'),
          ]),
        ],
      },
    ];

    for (const candidate of candidates) {
      const change = DocumentChange.between(before, candidate);
      const after = change.apply(before);
      const full = errorMessage(() => schemaApi.validateDocument(after));
      const incremental = errorMessage(() =>
        validateWithBuilder(before, change, schemaApi.validateDocumentChange)
      );

      assert.equal(
        incremental === null,
        full === null,
        `${JSON.stringify(candidate)}\nfull: ${full}\nincremental: ${incremental}`
      );
    }
  });

  it('matches full validation across generated structural and property edits', () => {
    const editor = createValidationEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();

    schemaApi.validateDocument(before);

    fc.assert(
      fc.property(
        fc.string({ maxLength: 24 }),
        fc.oneof(fc.boolean(), fc.integer(), fc.string({ maxLength: 8 })),
        fc.integer({ max: 4, min: 0 }),
        (text, bold, paragraphCount) => {
          const candidate: EditorDocumentValue = {
            ...before,
            children: [
              section(
                Array.from({ length: paragraphCount }, (_, index) =>
                  paragraphWithText(`${text}${index}`, { bold })
                )
              ),
            ],
          };
          const change = DocumentChange.between(before, candidate);
          const after = change.apply(before);
          const full = errorMessage(() => schemaApi.validateDocument(after));
          const incremental = errorMessage(() =>
            validateWithBuilder(
              before,
              change,
              schemaApi.validateDocumentChange
            )
          );

          assert.equal(incremental === null, full === null);
        }
      ),
      { numRuns: 64, seed: 20_260_721 }
    );
  });

  it('inherits only an immutable root validated by the same schema revision', () => {
    const editor = createValidationEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const change = DocumentChange.between(before, {
      ...before,
      children: [section([paragraph('changed'), paragraph('beta')])],
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    schemaApi.validateDocument(before);
    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      validateWithBuilder(before, change, schemaApi.validateDocumentChange);
      assert.equal(
        events.filter((id) => id === 'schema-validation-incremental-hit')
          .length,
        1
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-fallback').length,
        0
      );

      events.length = 0;
      const detached = structuredClone(before);
      freezeDocument(detached);
      assert.equal(Object.isFrozen(detached.children), true);
      const detachedChange = DocumentChange.between(detached, {
        ...detached,
        children: [section([paragraph('detached'), paragraph('beta')])],
      });

      validateWithBuilder(
        detached,
        detachedChange,
        schemaApi.validateDocumentChange
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-fallback').length,
        1
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });
});
