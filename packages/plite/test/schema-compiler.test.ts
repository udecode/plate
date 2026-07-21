import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  definePropertyPolicy,
  element,
  property,
  schema,
  target,
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
  getCompiledEditorSchema,
  getCompiledPropertyMergeStrategy,
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
  type EditorSchemaContributionRecord,
} from '@platejs/plite/internal';

const record = (
  extensionName: string,
  contribution: EditorSchemaContributionRecord['contribution'],
  order = 0
): EditorSchemaContributionRecord => ({ contribution, extensionName, order });

const createBasicSchema = () =>
  defineEditorSchema({
    elements: {
      paragraph: element({ content: schema.content.text() }),
    },
    id: 'article',
    root: schema.root({
      content: schema.content.type('paragraph', { min: 1 }),
    }),
    version: 1,
  });

afterEach(() => {
  delete (
    globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: unknown;
    }
  ).__PLITE_REACT_RENDER_PROFILER__;
});

describe('schema compiler', () => {
  it('compiles one immutable identity and ignores ordering and policy function identity', () => {
    const create = (validate: (value: unknown) => value is number) => {
      const Positive = definePropertyPolicy({
        id: 'positive',
        validate,
        version: 2,
      });

      return defineEditorSchema({
        elements: {
          paragraph: element({
            content: schema.content.text(),
            properties: { level: property.number({ policy: Positive }) },
          }),
        },
        id: 'article',
        root: schema.root({ content: schema.content.type('paragraph') }),
        version: 3,
      });
    };
    const Comments = schema.contribution({
      properties: [
        schema.textProperty('comment', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
    });
    const first = create(
      (value): value is number => typeof value === 'number' && value > 0
    );
    const second = create(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value) && value > 0
    );
    const left = compileEditorSchemaContributions(
      [record('comments', Comments, 20), record(first.name, first.schema, 10)],
      { revision: 7 }
    );
    const right = compileEditorSchemaContributions(
      [
        record(second.name, second.schema, 200),
        record('comments', Comments, 1),
      ],
      { revision: 9 }
    );

    assert.deepEqual(left.identity, {
      fingerprint: left.identity.fingerprint,
      id: 'article',
      version: 3,
    });
    assert.equal(left.identity.fingerprint, right.identity.fingerprint);
    assert.equal(left.revision, 7);
    assert.equal(right.revision, 9);
    assert.equal(Object.isFrozen(left.identity), true);
    assert.throws(
      () =>
        (left.elements.byType as Map<string, unknown>).set('bad', undefined),
      /immutable/
    );
    assert.throws(
      () => (left.elements.groups.get('block') as Set<string>).add('bad'),
      /immutable/
    );
  });

  it('compiles built-in and hierarchical groups without allowing group spoofing', () => {
    const Article = defineEditorSchema({
      elements: {
        callout: element({
          content: schema.content.text(),
          groups: ['indentable'],
        }),
        container: element({
          content: schema.content.group('block'),
        }),
        link: element({
          content: schema.content.text(),
          inline: true,
        }),
      },
      groups: {
        indentable: schema.group({ extends: ['block'] }),
      },
      id: 'article',
      root: schema.root({ content: schema.content.type('callout') }),
      version: 1,
    });
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
    ]);

    assert.deepEqual(
      [...compiled.elements.byType.get('callout')!.groups].sort(),
      ['all', 'block', 'element', 'indentable', 'textBlock']
    );
    assert.deepEqual(
      [...compiled.elements.groups.get('indentable')!],
      ['callout']
    );
    assert.deepEqual(
      [...compiled.elements.byType.get('container')!.groups].sort(),
      ['all', 'element']
    );
    assert.equal(
      compiled.elements.groups.get('block')!.has('container'),
      false
    );
    assert.equal(compiled.elements.groups.get('inline')!.has('callout'), false);
    assert.deepEqual([...compiled.elements.byType.get('link')!.groups].sort(), [
      'all',
      'element',
      'inline',
    ]);
    assert.equal(
      compiled.elements.groups.get('textBlock')!.has('container'),
      false
    );
    assert.deepEqual([...compiled.elements.textGroups].sort(), [
      'all',
      'inline',
      'text',
    ]);

    const Reserved = defineEditorSchema({
      elements: { paragraph: element({}) },
      groups: { block: schema.group() },
      id: 'reserved',
      root: schema.root({ content: schema.content.type('paragraph') }),
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Reserved.name, Reserved.schema),
        ]),
      /compiler-owned/
    );

    const Contradictory = defineEditorSchema({
      elements: {
        paragraph: element({ groups: ['pretendsInline'] }),
      },
      groups: {
        pretendsInline: schema.group({ extends: ['inline'] }),
      },
      id: 'contradictory',
      root: schema.root({ content: schema.content.type('paragraph') }),
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Contradictory.name, Contradictory.schema),
        ]),
      /contradicts its behavior/
    );

    const InlineBlock = defineEditorSchema({
      elements: {
        link: element({ groups: ['block'], inline: true }),
      },
      id: 'inline-block',
      root: schema.root({ content: schema.content.type('link') }),
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(InlineBlock.name, InlineBlock.schema),
        ]),
      /contradicts its compiled inline\/block behavior/
    );
  });

  it('compiles finite content algebra, cardinality, and unique defaults', () => {
    const Article = defineEditorSchema({
      elements: {
        image: element({ groups: ['block'], void: 'block' }),
        paragraph: element({
          content: schema.content.text(),
          groups: ['block'],
        }),
        quote: element({
          content: schema.content.all([
            schema.content.group('block'),
            schema.content.not(schema.content.type('image')),
          ]),
          groups: ['block'],
        }),
      },
      id: 'article',
      root: schema.root({
        content: schema.content.any(
          [schema.content.type('image'), schema.content.type('paragraph')],
          { default: { type: 'paragraph' }, min: 1 }
        ),
      }),
      version: 1,
    });
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
    ]);
    const quote = compiled.elements.byType.get('quote')!.content!;

    assert.deepEqual([...quote.allowedElementTypes].sort(), [
      'paragraph',
      'quote',
    ]);
    assert.equal(quote.allowsText, false);
    assert.deepEqual(compiled.primaryRoot.content.defaultPlan, {
      kind: 'element',
      type: 'paragraph',
    });
    assert.equal(compiled.primaryRoot.content.min, 1);
    assert.equal(compiled.primaryRoot.content.max, null);
  });

  it('rejects ambiguous and cyclic construction defaults', () => {
    const Ambiguous = defineEditorSchema({
      elements: {
        paragraph: element({ content: schema.content.text() }),
        section: element({
          content: schema.content.any(
            [schema.content.text(), schema.content.type('paragraph')],
            { min: 1 }
          ),
        }),
      },
      id: 'ambiguous',
      root: schema.root({ content: schema.content.type('section') }),
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Ambiguous.name, Ambiguous.schema),
        ]),
      /needs an explicit default/
    );

    const Cyclic = defineEditorSchema({
      elements: {
        a: element({
          content: schema.content.type('b', { min: 1 }),
        }),
        b: element({
          content: schema.content.type('a', { min: 1 }),
        }),
      },
      id: 'cyclic',
      root: schema.root({ content: schema.content.type('a', { min: 1 }) }),
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([record(Cyclic.name, Cyclic.schema)]),
      /(?:a -> b -> a|b -> a -> b)/
    );
  });

  it('compiles placement-aware property targets, lifecycle, and merge lookup', () => {
    const Article = defineEditorSchema({
      elements: {
        paragraph: element({
          content: schema.content.text(),
          groups: ['taggable'],
          properties: {
            shared: property.set(property.string()),
          },
        }),
        section: element({
          content: schema.content.type('paragraph'),
          properties: { shared: property.string() },
        }),
      },
      groups: { taggable: schema.group() },
      id: 'article',
      properties: [
        schema.textProperty('shared', property.string(), {
          inclusive: false,
          split: 'drop',
          target: target.and(
            target.group('taggable'),
            target.root(),
            target.parent(target.type('section')),
            target.not(target.type('section'))
          ),
          typeChange: 'preserve-if-allowed',
        }),
      ],
      root: schema.root({ content: schema.content.type('section') }),
      roots: {
        comments: schema.root({ content: schema.content.type('paragraph') }),
      },
      version: 1,
    });
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
    ]);
    const context = {
      ancestors: ['section'],
      root: null,
      type: 'paragraph',
    } as const;
    const textProperty = resolveCompiledSchemaProperty(
      compiled,
      'text',
      'shared',
      context
    );

    assert.equal(textProperty?.lifecycle.inclusive, false);
    assert.equal(textProperty?.lifecycle.split, 'drop');
    assert.equal(textProperty?.lifecycle.typeChange, 'preserve-if-allowed');
    assert.equal(
      getCompiledPropertyMergeStrategy(compiled, 'element', 'shared', context),
      'set'
    );
    assert.equal(
      getCompiledPropertyMergeStrategy(compiled, 'text', 'shared', context),
      'replace'
    );
    assert.equal(
      getCompiledPropertyMergeStrategy(compiled, 'element', 'shared', {
        ancestors: [],
        root: null,
        type: 'section',
      }),
      'replace'
    );
    assert.equal(
      matchesCompiledSchemaTarget(compiled, textProperty!.target, context),
      true
    );
    assert.equal(
      matchesCompiledSchemaTarget(compiled, textProperty!.target, {
        ...context,
        root: 'comments',
      }),
      false
    );
  });

  it('canonicalizes and validates raw set defaults at the compiler boundary', () => {
    const raw = (values: readonly unknown[]) =>
      ({
        elements: {
          paragraph: {
            properties: {
              tags: {
                default: values,
                equality: 'structural',
                item: {
                  equality: 'structural',
                  kind: 'string',
                  omitDefault: false,
                },
                kind: 'set',
                omitDefault: true,
              },
            },
          },
        },
        groups: {},
        id: 'raw',
        properties: [],
        root: {
          content: { allowed: { kind: 'type', type: 'paragraph' } },
        },
        roots: {},
        unknown: 'reject',
        version: 1,
      }) as unknown as EditorSchemaContributionRecord['contribution'];
    const first = compileEditorSchemaContributions([
      record('raw', raw(['b', 'a', 'b'])),
    ]);
    const second = compileEditorSchemaContributions([
      record('raw', raw(['a', 'b'])),
    ]);
    const [propertyId] = first.elements.byType.get('paragraph')!.propertyIds;

    assert.deepEqual(
      first.properties.byId.get(propertyId!)!.descriptor.default,
      ['a', 'b']
    );
    assert.equal(first.identity.fingerprint, second.identity.fingerprint);
    assert.throws(
      () =>
        compileEditorSchemaContributions([record('raw', raw(['valid', 2]))]),
      /does not match kind "string"/
    );
  });

  it('rejects overlapping exact and prefix selectors but allows disjoint targets', () => {
    const create = (
      properties: Parameters<typeof defineEditorSchema>[0]['properties']
    ) =>
      defineEditorSchema({
        elements: {
          paragraph: element({ content: schema.content.text() }),
          section: element({ content: schema.content.text() }),
        },
        id: 'selectors',
        properties,
        root: schema.root({ content: schema.content.type('paragraph') }),
        version: 1,
      });
    const Disjoint = create([
      schema.elementProperty('indent', property.number(), {
        target: target.type('paragraph'),
      }),
      schema.elementProperty('indent', property.number(), {
        target: target.type('section'),
      }),
    ]);

    assert.doesNotThrow(() =>
      compileEditorSchemaContributions([record(Disjoint.name, Disjoint.schema)])
    );

    const Overlap = create([
      schema.textProperty(schema.key.prefix('suggestion_'), property.string()),
      schema.textProperty('suggestion_state', property.string()),
    ]);

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Overlap.name, Overlap.schema),
        ]),
      (error) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.equal(error.diagnostics[0]?.code, 'property-selector-conflict');
        assert.deepEqual(error.diagnostics[0]?.extensions, [Overlap.name]);

        return true;
      }
    );
  });

  it('rejects ownership conflicts, cycles, and unknown references with provenance', () => {
    const Article = createBasicSchema();
    const Duplicate = schema.contribution({
      elements: { paragraph: element({}) },
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          record('duplicate', Duplicate),
        ]),
      (error) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.equal(error.diagnostics[0]?.code, 'duplicate-element-type');
        assert.deepEqual(error.diagnostics[0]?.extensions, [
          'duplicate',
          Article.name,
        ]);

        return true;
      }
    );

    const Unknown = schema.contribution({
      properties: [
        schema.textProperty('bad', property.boolean(), {
          target: target.group('missing'),
        }),
      ],
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          record('unknown', Unknown),
        ]),
      /unknown group "missing"/
    );

    const Groups = defineEditorSchema({
      elements: { paragraph: element({}) },
      groups: {
        a: schema.group({ extends: ['b'] }),
        b: schema.group({ extends: ['a'] }),
      },
      id: 'groups',
      root: schema.root({ content: schema.content.type('paragraph') }),
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([record(Groups.name, Groups.schema)]),
      /a -> b -> a/
    );
  });

  it('applies slice policy defaults and records compiler timing', () => {
    const Article = defineEditorSchema({
      elements: {
        image: element({
          slice: { replaceWhenCovered: false },
          void: 'block',
        }),
        paragraph: element({ content: schema.content.text() }),
        quote: element({ slice: { preserveContext: true } }),
      },
      id: 'article',
      root: schema.root({ content: schema.content.type('paragraph') }),
      version: 1,
    });
    const events: Array<{ id: string }> = [];

    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
    ]);

    assert.deepEqual(compiled.elements.byType.get('paragraph')!.slice, {
      preserveContext: false,
      replaceWhenCovered: true,
    });
    assert.deepEqual(compiled.elements.byType.get('quote')!.slice, {
      preserveContext: true,
      replaceWhenCovered: false,
    });
    assert.deepEqual(compiled.elements.byType.get('image')!.slice, {
      preserveContext: false,
      replaceWhenCovered: false,
    });
    assert.deepEqual(
      events.map(({ id }) => id),
      ['schema-compile']
    );

    for (const [type, invalid] of [
      ['atom', element({ atom: true, slice: { preserveContext: false } })],
      ['void', element({ slice: { preserveContext: true }, void: 'block' })],
    ] as const) {
      const Invalid = defineEditorSchema({
        elements: {
          invalid,
          paragraph: element({ content: schema.content.text() }),
        },
        id: `invalid-${type}-slice-policy`,
        root: schema.root({ content: schema.content.type('paragraph') }),
        version: 1,
      });

      assert.throws(
        () =>
          compileEditorSchemaContributions([
            record(Invalid.name, Invalid.schema),
          ]),
        /cannot preserve slice context.*does not expose editable child content/i
      );
    }
  });

  it('publishes nullable state identity and reuses equivalent compiled schemas', () => {
    const slot = defineExtensionSlot('article-schema');
    const create = () => {
      const NonEmpty = definePropertyPolicy<string>({
        id: 'non-empty',
        validate: (value): value is string =>
          typeof value === 'string' && value.length > 0,
        version: 1,
      });

      return defineEditorSchema({
        elements: {
          paragraph: element({
            content: schema.content.text(),
            properties: { label: property.string({ policy: NonEmpty }) },
          }),
        },
        id: 'article',
        root: schema.root({ content: schema.content.type('paragraph') }),
        version: 1,
      });
    };
    const rawEditor = createEditor();
    const events: string[] = [];

    assert.equal(rawEditor.read.schema.identity(), null);
    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    const editor = createEditor({ extensions: [slot.of(create())] as const });
    const before = getCompiledEditorSchema(editor)!;

    assert.deepEqual(
      events.filter((id) => id === 'schema-compile'),
      ['schema-compile']
    );
    assert.equal(editor.read.schema.identity(), before.identity);
    events.length = 0;

    editor.update.extensions.reconfigure(slot, create());

    const after = getCompiledEditorSchema(editor)!;

    assert.deepEqual(
      events.filter((id) => id === 'schema-compile'),
      []
    );
    assert.equal(after, before);
    assert.equal(after.revision, before.revision);
    assert.equal(editor.read.schema.identity(), before.identity);
  });

  it('keeps a no-contribution editor outside the compiler contract', () => {
    assert.throws(
      () => compileEditorSchemaContributions([]),
      /exactly one complete schema/
    );
  });
});
