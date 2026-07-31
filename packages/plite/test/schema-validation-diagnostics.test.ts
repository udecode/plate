import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  EditorSchemaValidationError,
  property,
  schema,
  target,
  type EditorSchemaValidationDiagnostic,
} from '@platejs/plite';

const Schema = defineEditorSchema({
  elements: {
    code: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    container: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    } as const,
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { count: property.number() },
    } as const,
    portal: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    } as const,
  },
  id: 'validation-diagnostics',
  properties: [
    schema.textProperty('bold', property.boolean(), {
      target: target.type('paragraph'),
    }),
    schema.textProperty('tone', property.string(), {
      target: target.type('code'),
    }),
    schema.textProperty('tone', property.string(), {
      target: target.type('paragraph'),
    }),
  ],
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  roots: {
    header: schema.content.type('heading'),
  },
  unknown: 'reject',
  version: 1,
});

const createDiagnosticEditor = () =>
  createEditor({
    extensions: [Schema],
    initialValue: [{ type: 'paragraph', children: [{ text: 'valid' }] }],
  });

const captureError = (run: () => void) => {
  let thrown: unknown;

  try {
    run();
  } catch (error) {
    thrown = error;
  }

  assert.ok(thrown instanceof EditorSchemaValidationError);
  assert.equal(thrown.diagnostics.length, 1);

  return thrown;
};

const captureDiagnostic = (run: () => void) =>
  captureError(run).diagnostics[0]!;

const withoutMessage = ({
  message: _message,
  ...diagnostic
}: EditorSchemaValidationDiagnostic) => diagnostic;

describe('runtime schema validation diagnostics', () => {
  it('rejects the internal primary-root sentinel in property queries', () => {
    const editor: ReturnType<typeof createDiagnosticEditor> =
      createDiagnosticEditor();
    const root: string = 'main';

    assert.throws(
      () =>
        editor.read.schema.property({
          key: 'bold',
          placement: 'text',
          root,
          type: 'paragraph',
        }),
      /primary schema root is implicit/i
    );
  });

  it('reports one resolved property for an invalid value', () => {
    const editor = createDiagnosticEditor();
    const bold = editor.read.schema.property({
      key: 'bold',
      placement: 'text',
      type: 'paragraph',
    });

    assert.ok(bold);
    const diagnostic = captureDiagnostic(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            type: 'paragraph',
            children: [{ bold: 'yes', text: 'invalid' }],
          },
        ],
      })
    );

    assert.equal(
      diagnostic.message,
      'Editor text property "bold" must be boolean.'
    );
    assert.deepEqual(withoutMessage(diagnostic), {
      ancestorTypes: ['paragraph'],
      code: 'invalid-property-value',
      nodeType: 'text',
      parentType: 'paragraph',
      path: [0, 0],
      property: {
        extensions: ['schema:validation-diagnostics'],
        ids: [bold.id],
        key: 'bold',
        placement: 'text',
        targets: [bold.target],
      },
      root: null,
    });
    assert.ok(Object.isFrozen(diagnostic.property));
    assert.ok(Object.isFrozen(diagnostic.property!.ids));
    assert.ok(Object.isFrozen(diagnostic.property!.targets));
    assert.ok(Object.isFrozen(diagnostic.property!.targets[0]));
  });

  it('locates invalid element-property values', () => {
    const editor = createDiagnosticEditor();
    const count = editor.read.schema.property({
      key: 'count',
      placement: 'element',
      type: 'paragraph',
    });

    assert.ok(count);
    const error = captureError(() =>
      editor.read.schema.assertFragment([
        {
          type: 'paragraph',
          count: 'one',
          children: [{ text: '' }],
        },
      ])
    );
    const diagnostic = error.diagnostics[0]!;

    assert.ok(error.cause instanceof Error);
    assert.deepEqual(withoutMessage(diagnostic), {
      code: 'invalid-property-value',
      nodeType: 'paragraph',
      path: [0],
      property: {
        extensions: ['schema:validation-diagnostics'],
        ids: [count.id],
        key: 'count',
        placement: 'element',
        targets: [count.target],
      },
      root: null,
    });
  });

  it('reports every candidate for a target mismatch', () => {
    const editor = createDiagnosticEditor();
    const candidates = ['code', 'paragraph']
      .map((type) =>
        editor.read.schema.property({
          key: 'tone',
          placement: 'text',
          type,
        })
      )
      .filter((value) => value !== null)
      .sort((left, right) => left.id.localeCompare(right.id));
    const diagnostic = captureDiagnostic(() =>
      editor.read.schema.assertFragment([
        {
          type: 'heading',
          children: [{ text: 'invalid', tone: 'loud' }],
        },
      ])
    );

    assert.deepEqual(withoutMessage(diagnostic), {
      ancestorTypes: ['heading'],
      code: 'property-target-mismatch',
      nodeType: 'text',
      parentType: 'heading',
      path: [0, 0],
      property: {
        extensions: ['schema:validation-diagnostics'],
        ids: candidates.map(({ id }) => id),
        key: 'tone',
        placement: 'text',
        targets: candidates.map(({ target }) => target),
      },
      root: null,
    });
  });

  it('omits property context for unknown elements and properties', () => {
    const editor = createDiagnosticEditor();
    const unknownElement = captureDiagnostic(() =>
      editor.read.schema.assertDocument({
        children: [{ type: 'mystery', children: [{ text: '' }] }],
      })
    );
    const unknownProperty = captureDiagnostic(() =>
      editor.read.schema.assertFragment([
        {
          type: 'paragraph',
          children: [{ mystery: true, text: '' }],
        },
      ])
    );

    assert.deepEqual(withoutMessage(unknownElement), {
      code: 'unknown-element',
      nodeType: 'mystery',
      path: [0],
      root: null,
    });
    assert.deepEqual(withoutMessage(unknownProperty), {
      ancestorTypes: ['paragraph'],
      code: 'unknown-property',
      nodeType: 'text',
      parentType: 'paragraph',
      path: [0, 0],
      root: null,
    });
  });

  it('locates invalid parent content in primary, named, and projected roots', () => {
    const editor = createDiagnosticEditor();
    const primary = captureDiagnostic(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            type: 'container',
            children: [{ type: 'code', children: [{ text: '' }] }],
          },
        ],
      })
    );
    const named = captureDiagnostic(() =>
      editor.read.schema.assertDocument({
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
      })
    );
    const projected = captureDiagnostic(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            childRoots: { body: 'portal:1' },
            type: 'portal',
            children: [{ text: '' }],
          },
        ],
        roots: {
          'portal:1': [{ type: 'code', children: [{ text: '' }] }],
        },
      })
    );

    assert.deepEqual(withoutMessage(primary), {
      ancestorTypes: ['container'],
      code: 'invalid-content',
      nodeType: 'code',
      parentType: 'container',
      path: [0, 0],
      root: null,
    });
    assert.deepEqual(withoutMessage(named), {
      code: 'invalid-content',
      nodeType: 'paragraph',
      path: [0],
      root: 'header',
    });
    assert.deepEqual(withoutMessage(projected), {
      code: 'invalid-content',
      nodeType: 'code',
      path: [0],
      root: 'portal:1',
    });
  });

  it('wraps JSON ingress and deeply freezes public diagnostics', () => {
    const editor: ReturnType<typeof createDiagnosticEditor> =
      createDiagnosticEditor();
    let thrown: unknown;

    try {
      editor.read.schema.assertFragment([
        {
          type: 'paragraph',
          children: [{ payload: () => true, text: '' }],
        },
      ]);
    } catch (error) {
      thrown = error;
    }

    assert.ok(thrown instanceof EditorSchemaValidationError);
    assert.ok(thrown.cause instanceof Error);
    assert.deepEqual(withoutMessage(thrown.diagnostics[0]!), {
      code: 'invalid-json',
      path: [],
      root: null,
    });
    assert.ok(Object.isFrozen(thrown.diagnostics));
    assert.ok(Object.isFrozen(thrown.diagnostics[0]));
    assert.ok(Object.isFrozen(thrown.diagnostics[0]!.path));

    assert.throws(
      () => editor.read.schema.assertDocument(null),
      /object with a children array/
    );
    assert.throws(
      () => editor.read.schema.assertDocument({ roots: {} }),
      /object with a children array/
    );
    assert.throws(
      () => editor.read.schema.assertFragment({ children: [] }),
      /fragment must be an array/
    );
  });
});
