import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  defineExtensionSlot,
  property,
  schema,
  target,
  type SchemaContent,
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
  getCompiledEditorConfiguration,
  getCompiledEditorSchema,
  getCompiledSchemaPropertyId,
  getCompiledPropertyMergeStrategy,
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
  type EditorSchemaContributionRecord,
} from '@platejs/plite/internal';
import { hashSchemaIdentityString } from '../src/core/schema-compiler';

const legacyHashSchemaIdentityString = (value: string) => {
  let hash = 0xcbf29ce484222325n;

  for (let index = 0; index < value.length; index++) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }

  return hash.toString(16).padStart(16, '0');
};

const record = (
  extensionName: string,
  contribution: EditorSchemaContributionRecord['contribution']
): EditorSchemaContributionRecord => ({ contribution, extensionName });

const createBasicSchema = () =>
  defineEditorSchema('schema:article', {
    elements: {
      paragraph: { content: schema.content.text() } as const,
    },
    id: 'article',
    root: schema.content.type('paragraph', { min: 1 }),
    unknown: 'reject',
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
  it('applies schema overrides before compiling every relationship', () => {
    const indent = schema.elementProperty('indent', property.number(), {
      target: target.type('quote'),
    });
    const indentId = getCompiledSchemaPropertyId(indent);
    const records = [
      record('paragraph', {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
      }),
      record('quote', {
        elements: {
          quote: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        },
        properties: [indent],
      }),
      record('schema', {
        id: 'overridden-article',
        root: schema.content.type('quote', { min: 1 }),
        unknown: 'reject',
        version: 1,
      }),
      record('application', {
        overrides: [
          {
            element: 'paragraph',
            kind: 'element',
            source: 'paragraph',
            type: 'p',
          },
          {
            id: indentId,
            kind: 'property',
            source: 'quote',
            target: target.type('p'),
          },
        ],
      }),
    ] as const;
    const compiled = compileEditorSchemaContributions(records);
    const quote = compiled.elements.byType.get('quote')!;
    const overriddenIndent = [...compiled.properties.byId.values()].find(
      (candidate) => candidate.key === 'indent'
    )!;

    assert.equal(compiled.elements.byType.has('paragraph'), false);
    assert.equal(compiled.elements.byType.has('p'), true);
    assert.deepEqual([...quote.content!.allowedElementTypes], ['p']);
    assert.deepEqual(quote.content!.defaultPlan, {
      kind: 'element',
      type: 'p',
    });
    assert.deepEqual(overriddenIndent.target, target.type('p'));

    const permuted = compileEditorSchemaContributions([...records].reverse());
    assert.equal(permuted.identity.fingerprint, compiled.identity.fingerprint);
  });

  it('rejects ambiguous and unknown schema overrides', () => {
    const paragraph = record('paragraph', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
    });
    const rename = {
      element: 'paragraph',
      kind: 'element' as const,
      source: 'paragraph',
      type: 'p',
    };

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          paragraph,
          record('first-policy', { overrides: [rename] }),
          record('second-policy', {
            overrides: [{ ...rename, type: 'textBlock' }],
          }),
        ]),
      /override facet.*owned by both/i
    );
    assert.throws(
      () =>
        compileEditorSchemaContributions([
          paragraph,
          record('application', {
            overrides: [{ ...rename, element: 'missing' }],
          }),
        ]),
      /targets unknown element/i
    );
  });

  it('remaps the implicit derived root when its paragraph owner is overridden', () => {
    const compiled = compileEditorSchemaContributions([
      record('paragraph', {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
      }),
      record('application', {
        overrides: [
          {
            element: 'paragraph',
            kind: 'element',
            source: 'paragraph',
            type: 'p',
          },
        ],
      }),
    ]);

    assert.equal(compiled.elements.byType.has('paragraph'), false);
    assert.equal(compiled.elements.byType.has('p'), true);
  });

  it('projects targeted content-root ownership into matching element types', () => {
    const Article = defineEditorSchema('schema:derived', {
      contentRoots: [
        {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
          slot: 'caption',
          target: target.types(['image', 'video']),
        },
      ],
      elements: {
        image: { void: 'block' },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        video: {
          contentRoots: {
            preview: schema.content.type('paragraph'),
          },
          void: 'block',
        },
      },
      root: schema.content.types(['image', 'video']),
      unknown: 'reject',
    });
    const editor = createEditor({ extensions: [Article] });

    assert.deepEqual(editor.read.schema.element('image')?.contentRoots, {
      caption: {
        content: {
          allowedElementTypes: ['paragraph'],
          allowsText: false,
          allowsUnknownElements: false,
          default: { type: 'paragraph' },
          max: null,
          min: 1,
        },
        ownership: 'exclusive',
      },
    });
    assert.equal(
      editor.read.schema.element('paragraph')?.contentRoots.caption,
      undefined
    );
    assert.equal(
      editor.read.schema.element('video')?.contentRoots.preview?.ownership,
      'shared'
    );
  });

  it('fingerprints content-root ownership and rejects overlapping slot owners', () => {
    const compile = (ownership: 'exclusive' | 'shared') =>
      compileEditorSchemaContributions([
        record('schema', {
          elements: {
            paragraph: { content: schema.content.text() },
            portal: { void: 'block' },
          },
          root: schema.content.type('portal'),
          unknown: 'reject',
        }),
        record('portal-content', {
          contentRoots: [
            {
              content: schema.content.type('paragraph'),
              ownership,
              slot: 'body',
              target: target.type('portal'),
            },
          ],
        }),
      ]);
    const shared = compile('shared');
    const exclusive = compile('exclusive');

    assert.notEqual(
      shared.identity.fingerprint,
      exclusive.identity.fingerprint
    );
    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record('schema', {
            elements: {
              paragraph: { content: schema.content.text() },
              portal: {
                contentRoots: {
                  body: schema.content.type('paragraph'),
                },
                void: 'block',
              },
            },
            root: schema.content.type('portal'),
            unknown: 'reject',
          }),
          record('second-owner', {
            contentRoots: [
              {
                content: schema.content.type('paragraph'),
                ownership: 'exclusive',
                slot: 'body',
                target: target.type('portal'),
              },
            ],
          }),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics[0], {
          code: 'content-root-slot-conflict',
          extensions: ['schema', 'second-owner'],
          message:
            'Schema content root slot "body" for element type "portal" is declared by both "schema" and "second-owner".',
          path: 'contentRoots.0',
        });

        return true;
      }
    );
  });

  it('admits contributed inline elements into the derived paragraph', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('inline-elements', {
          schema: {
            elements: {
              image: { void: 'block' },
              link: {
                content: schema.content.text({ default: 'text', min: 1 }),
                inline: true,
              },
              mention: { void: 'markable-inline' },
            },
          },
        }),
      ],
    });
    const paragraph = editor.read.schema.element('paragraph');

    assert.deepEqual(paragraph?.content?.allowedElementTypes, [
      'link',
      'mention',
    ]);
    assert.equal(paragraph?.content?.allowsText, true);
    assert.equal(
      editor.read.schema.allowsElementType('paragraph', 'mention'),
      true
    );
    assert.equal(
      editor.read.schema.allowsElementType('paragraph', 'image'),
      false
    );
  });

  it('reports malformed nested declarations with owner and path provenance', () => {
    const Article = createBasicSchema();
    const malformed = [
      record('malformed-element', {
        elements: { broken: null },
      } as unknown as EditorSchemaContributionRecord['contribution']),
      record('malformed-group', {
        groups: { broken: null },
      } as unknown as EditorSchemaContributionRecord['contribution']),
      record('malformed-property', {
        properties: [null],
      } as unknown as EditorSchemaContributionRecord['contribution']),
    ];

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          ...malformed,
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(
          error.diagnostics.map(({ code, extensions, path }) => ({
            code,
            extensions,
            path,
          })),
          [
            {
              code: 'invalid-schema-shape',
              extensions: ['malformed-element'],
              path: 'elements.broken',
            },
            {
              code: 'invalid-schema-shape',
              extensions: ['malformed-group'],
              path: 'groups.broken',
            },
            {
              code: 'invalid-schema-shape',
              extensions: ['malformed-property'],
              path: 'properties.0',
            },
          ]
        );

        return true;
      }
    );
  });

  it('rejects hidden and symbol declaration keys even after a clean cache hit', () => {
    const Clean = createBasicSchema();
    const symbol = Symbol('secret');
    const element = { content: schema.content.text() };

    Object.defineProperty(element, 'hidden', {
      enumerable: false,
      value: true,
    });
    Object.defineProperty(element, symbol, { enumerable: true, value: true });
    const Closed = defineEditorSchema('schema:article', {
      elements: { paragraph: element },
      id: 'article',
      root: schema.content.type('paragraph', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });

    createEditor({ extensions: [Clean] });
    assert.throws(
      () => createEditor({ extensions: [Closed] }),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(
          error.diagnostics.map(({ code, extensions, path }) => ({
            code,
            extensions,
            path,
          })),
          [
            {
              code: 'unknown-schema-key',
              extensions: [Closed.name],
              path: 'elements.paragraph.[Symbol(secret)]',
            },
            {
              code: 'unknown-schema-key',
              extensions: [Closed.name],
              path: 'elements.paragraph.hidden',
            },
          ]
        );

        return true;
      }
    );
  });

  it('rejects malformed inline property validation', () => {
    const Article = createBasicSchema();

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          record('malformed-validation', {
            properties: [
              {
                inclusive: true,
                key: 'forged',
                placement: 'text',
                split: 'preserve',
                target: null,
                typeChange: 'drop',
                value: {
                  kind: 'json',
                  omitDefault: false,
                  validate: (value: unknown): value is string =>
                    typeof value === 'string',
                },
              },
            ],
          } as unknown as EditorSchemaContributionRecord['contribution']),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(
          error.diagnostics.map(({ code, extensions, path }) => ({
            code,
            extensions,
            path,
          })),
          [
            {
              code: 'invalid-property-validation',
              extensions: ['malformed-validation'],
              path: 'properties.0',
            },
          ]
        );

        return true;
      }
    );
  });

  it('recognizes the primary root as the complete-schema discriminator', () => {
    const Article = createBasicSchema();
    const malformedComplete = {
      root: schema.content.type('paragraph'),
    } as unknown as EditorSchemaContributionRecord['contribution'];

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          record('complete-without-unknown', malformedComplete),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'duplicate-complete-schema',
            extensions: ['complete-without-unknown', 'schema:article'],
            message:
              'Schema contributions contain multiple complete schemas: complete-without-unknown, schema:article.',
            path: 'schema',
          },
        ]);

        return true;
      }
    );
  });

  it('requires complete and named schema fields to remain atomic', () => {
    const complete = createBasicSchema().schema;

    for (const field of ['id', 'root', 'version'] as const) {
      const malformed = { ...complete } as Record<string, unknown>;

      delete malformed[field];
      assert.throws(
        () =>
          compileEditorSchemaContributions([
            record(
              `complete-without-${field}`,
              malformed as EditorSchemaContributionRecord['contribution']
            ),
          ]),
        (error: unknown) => {
          assert.ok(error instanceof EditorSchemaCompileError);
          assert.deepEqual(
            error.diagnostics,
            field === 'root'
              ? (['id', 'version'] as const).map((completeField) => ({
                  code: 'partial-schema-complete-field',
                  extensions: [`complete-without-${field}`],
                  message: `Partial schema contribution "complete-without-${field}" cannot declare complete schema field "${completeField}".`,
                  path: `schema.${completeField}`,
                }))
              : [
                  {
                    code: 'missing-complete-schema-field',
                    extensions: [`complete-without-${field}`],
                    message: `Named schema definition "complete-without-${field}" must own schema field "${field}".`,
                    path: `schema.${field}`,
                  },
                ]
          );

          return true;
        }
      );
    }
  });

  it('keeps named roots additive in partial contributions', () => {
    const Article = createBasicSchema();
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
      record('comments-root', {
        roots: {
          comments: schema.content.type('paragraph'),
        },
      }),
    ]);

    assert.deepEqual([...compiled.roots.keys()], ['comments']);
    assert.equal(compiled.roots.get('comments')?.name, 'comments');
  });

  it('preserves legacy FNV-1a identity for every UTF-16 unit and random sequences', () => {
    const boundaryInputs = [
      '',
      '\0',
      'plain ASCII',
      '\u0000\u0001\u00ff\u0100\u7fff\u8000\ufffe\uffff',
      '\ud800',
      '\udfff',
      '😀🧑🏽‍💻',
      'a'.repeat(4096),
      '\uffff'.repeat(4096),
    ];

    for (const input of boundaryInputs) {
      assert.equal(
        hashSchemaIdentityString(input),
        legacyHashSchemaIdentityString(input)
      );
    }

    for (let codeUnit = 0; codeUnit <= 0xff_ff; codeUnit += 1) {
      const input = String.fromCharCode(codeUnit);

      assert.equal(
        hashSchemaIdentityString(input),
        legacyHashSchemaIdentityString(input)
      );
    }

    let state = 0x9e_37_79_b9;
    const next = () => {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;

      return state;
    };

    for (let sample = 0; sample < 4096; sample += 1) {
      const length = next() % 129;
      let input = '';

      for (let index = 0; index < length; index += 1) {
        input += String.fromCharCode(next() & 0xff_ff);
      }

      assert.equal(
        hashSchemaIdentityString(input),
        legacyHashSchemaIdentityString(input)
      );
    }
  });

  it('compiles one immutable identity and ignores validator function identity', () => {
    const create = (
      validate: (value: unknown) => value is number,
      validationVersion = 2
    ) =>
      defineEditorSchema('schema:article', {
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: {
              level: property.number({
                validate,
                validationVersion,
              }),
            },
          } as const,
        },
        id: 'article',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 3,
      });
    const Comments = {
      properties: [
        schema.textProperty('comment', property.string(), {
          target: target.type('paragraph'),
        }),
      ],
    } as const;
    const first = create(
      (value): value is number => typeof value === 'number' && value > 0
    );
    const second = create(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value) && value > 0
    );
    const left = compileEditorSchemaContributions(
      [record('comments', Comments), record(first.name, first.schema)],
      { revision: 7 }
    );
    const right = compileEditorSchemaContributions(
      [record(second.name, second.schema), record('comments', Comments)],
      { revision: 9 }
    );
    const changedValidation = create(
      (value): value is number => typeof value === 'number' && value > 0,
      3
    );
    const changed = compileEditorSchemaContributions([
      record(changedValidation.name, changedValidation.schema),
      record('comments', Comments),
    ]);

    assert.deepEqual(left.identity, {
      fingerprint: left.identity.fingerprint,
      id: 'article',
      kind: 'named',
      version: 3,
    });
    assert.equal(left.identity.fingerprint, right.identity.fingerprint);
    assert.notEqual(left.identity.fingerprint, changed.identity.fingerprint);
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

  it('canonicalizes target type sets at compilation', () => {
    const create = (types: readonly string[]) =>
      defineEditorSchema('schema:canonical-target-types', {
        elements: {
          paragraph: { content: schema.content.text() },
          quote: { content: schema.content.text() },
        },
        id: 'canonical-target-types',
        properties: [
          schema.elementProperty('tone', property.string(), {
            target: target.types(types),
          }),
        ],
        root: schema.content.types(['paragraph', 'quote']),
        unknown: 'reject',
        version: 1,
      });
    const left = compileEditorSchemaContributions([
      record('left', create(['quote', 'paragraph', 'paragraph']).schema),
    ]);
    const right = compileEditorSchemaContributions([
      record('right', create(['paragraph', 'quote']).schema),
    ]);
    const [compiledProperty] = left.properties.byId.values();

    assert.deepEqual(compiledProperty?.target, {
      kind: 'types',
      types: ['paragraph', 'quote'],
    });
    assert.equal(left.identity.fingerprint, right.identity.fingerprint);
  });

  it('compiles built-in and hierarchical groups without allowing group spoofing', () => {
    const Article = defineEditorSchema('schema:article', {
      elements: {
        callout: {
          content: schema.content.text(),
          groups: ['indentable'],
        } as const,
        container: {
          content: schema.content.group('block'),
        } as const,
        link: {
          content: schema.content.text(),
          inline: true,
        } as const,
      },
      groups: {
        indentable: { extends: ['block'] } as const,
      },
      id: 'article',
      root: schema.content.type('callout'),
      unknown: 'reject',
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
      ['all', 'block', 'element']
    );
    assert.equal(compiled.elements.groups.get('block')!.has('container'), true);
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

    const Reserved = defineEditorSchema('schema:reserved', {
      elements: { paragraph: { content: schema.content.text() } },
      groups: { block: {} as const },
      id: 'reserved',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Reserved.name, Reserved.schema),
        ]),
      /compiler-owned/
    );

    const Contradictory = defineEditorSchema('schema:contradictory', {
      elements: {
        paragraph: {
          content: schema.content.text(),
          groups: ['pretendsInline'],
        } as const,
      },
      groups: {
        pretendsInline: { extends: ['inline'] } as const,
      },
      id: 'contradictory',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Contradictory.name, Contradictory.schema),
        ]),
      /contradicts its behavior/
    );

    const RedundantBlock = defineEditorSchema('schema:redundant-block', {
      elements: {
        link: {
          content: schema.content.text(),
          // Deliberately invalid: built-in membership is compiler-owned.
          groups: ['block'],
        } as const,
      },
      id: 'redundant-block',
      root: schema.content.type('link'),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(RedundantBlock.name, RedundantBlock.schema),
        ]),
      /cannot declare compiler-owned group "block"/
    );
  });

  it('compiles finite content algebra, cardinality, and unique defaults', () => {
    const Article = defineEditorSchema('schema:article', {
      elements: {
        image: { void: 'block' } as const,
        paragraph: {
          content: schema.content.text(),
        } as const,
        quote: {
          content: schema.content.all([
            schema.content.group('block'),
            schema.content.not(schema.content.type('image')),
          ]),
        } as const,
      },
      id: 'article',
      root: schema.content.any(
        [schema.content.type('image'), schema.content.type('paragraph')],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      unknown: 'reject',
      version: 1,
    });
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
    ]);
    const image = compiled.elements.byType.get('image')!;
    const quote = compiled.elements.byType.get('quote')!.content!;

    assert.deepEqual([...image.groups].sort(), ['all', 'block', 'element']);
    assert.equal(image.content?.allowsText, true);
    assert.equal(image.content?.min, 1);
    assert.equal(image.content?.max, 1);
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

  it('requires explicit nonvoid content and derives noneditable void content', () => {
    for (const [id, element, message] of [
      ['missing-content', {}, /must declare content explicitly/u],
      [
        'editable-island-content',
        { void: 'editable-island' },
        /must declare content explicitly/u,
      ],
      [
        'redundant-void-content',
        { content: schema.content.text(), void: 'block' },
        /derives its canonical empty text child/u,
      ],
    ] as const) {
      const Invalid = defineEditorSchema('schema:derived', {
        elements: { invalid: element },
        id,
        root: schema.content.type('invalid'),
        unknown: 'reject',
        version: 1,
      });

      assert.throws(
        () =>
          compileEditorSchemaContributions([
            record(Invalid.name, Invalid.schema),
          ]),
        message
      );
    }
  });

  it('requires canonical text spacers around declared inline children', () => {
    const createNestedInlineSchema = (id: string, content: SchemaContent) =>
      defineEditorSchema('schema:derived', {
        elements: {
          inner: {
            content: schema.content.text({ default: 'text', min: 1 }),
            inline: true,
          } as const,
          outer: { content, inline: true } as const,
          paragraph: {
            content: schema.content.any(
              [schema.content.text(), schema.content.type('outer')],
              { default: 'text', min: 1 }
            ),
          } as const,
        },
        id,
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });
    const MissingText = createNestedInlineSchema(
      'nested-inline-missing-text',
      schema.content.type('inner', {
        default: { type: 'inner' },
        min: 1,
      })
    );

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(MissingText.name, MissingText.schema),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'inline-content-requires-text',
            extensions: [MissingText.name],
            message:
              'Schema element "outer" allows inline child type "inner", but canonical inline content requires text spacers.',
            path: 'elements.outer.content',
          },
        ]);

        return true;
      }
    );

    const InsufficientMaximum = createNestedInlineSchema(
      'nested-inline-insufficient-maximum',
      schema.content.any(
        [schema.content.text(), schema.content.type('inner')],
        { default: 'text', max: 2, min: 1 }
      )
    );

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(InsufficientMaximum.name, InsufficientMaximum.schema),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'inline-content-requires-spacers',
            extensions: [InsufficientMaximum.name],
            message:
              'Schema element "outer" allows inline child type "inner", but maximum content cardinality 2 cannot fit one inline child and its two canonical text spacers.',
            path: 'elements.outer.content',
          },
        ]);

        return true;
      }
    );

    const createValid = (id: string, max?: number) =>
      createNestedInlineSchema(
        id,
        schema.content.any(
          [schema.content.text(), schema.content.type('inner')],
          { default: 'text', ...(max === undefined ? {} : { max }), min: 1 }
        )
      );
    const ExactMinimum = createValid('nested-inline-exact-minimum', 3);
    const Unbounded = createValid('nested-inline-unbounded');

    for (const extension of [ExactMinimum, Unbounded]) {
      const compiled = compileEditorSchemaContributions([
        record(extension.name, extension.schema),
      ]);
      const outer = compiled.elements.byType.get('outer')!;

      assert.equal(outer.content?.allowsText, true);
      assert.equal(outer.content?.allowedElementTypes.has('inner'), true);
    }

    const editor = createEditor({
      extensions: [ExactMinimum],
      initialSelection: {
        anchor: { offset: 1, path: [0, 1, 1, 0] },
        focus: { offset: 1, path: [0, 1, 1, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [
                { text: '' },
                { children: [{ text: 'x' }], type: 'inner' },
                { text: '' },
              ],
              type: 'outer',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => tx.text.insert('!'));
    assert.equal(editor.read.text.string([]), 'x!');
  });

  it('rejects declared block children in inline element content', () => {
    const Invalid = defineEditorSchema('schema:inline-with-block-child', {
      elements: {
        block: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        inline: {
          content: schema.content.type('block', {
            default: { type: 'block' },
            max: 1,
            min: 1,
          }),
          inline: true,
        } as const,
      },
      id: 'inline-with-block-child',
      root: schema.content.type('block', {
        default: { type: 'block' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Invalid.name, Invalid.schema),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'inline-content-rejects-blocks',
            extensions: [Invalid.name],
            message:
              'Schema inline element "inline" allows block child type "block", but inline element content can contain only text and inline elements.',
            path: 'elements.inline.content',
          },
        ]);

        return true;
      }
    );
  });

  it('rejects unknown element children in inline element content', () => {
    const Invalid = defineEditorSchema('schema:inline-with-unknown-child', {
      elements: {
        inline: {
          content: schema.content.open(),
          inline: true,
        } as const,
      },
      id: 'inline-with-unknown-child',
      root: schema.content.type('inline'),
      unknown: 'preserve',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Invalid.name, Invalid.schema),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'inline-content-rejects-unknown-elements',
            extensions: [Invalid.name],
            message:
              'Schema inline element "inline" allows unknown element children, but undeclared elements cannot be proven inline.',
            path: 'elements.inline.content',
          },
        ]);

        return true;
      }
    );
  });

  it('keeps declared and unknown block children valid in block content', () => {
    const Declared = defineEditorSchema('schema:declared-block-child', {
      elements: {
        child: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        parent: {
          content: schema.content.type('child', {
            default: { type: 'child' },
            min: 1,
          }),
        } as const,
      },
      id: 'declared-block-child',
      root: schema.content.type('parent', {
        default: { type: 'parent' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const declaredEditor = createEditor({
      extensions: [Declared],
      initialValue: [
        {
          children: [{ children: [{ text: 'x' }], type: 'child' }],
          type: 'parent',
        },
      ],
    });

    declaredEditor.update((tx) =>
      tx.text.insert('!', { at: { offset: 1, path: [0, 0, 0] } })
    );
    assert.equal(declaredEditor.read.text.string([]), 'x!');

    const Open = defineEditorSchema('schema:unknown-block-child', {
      elements: {
        parent: {
          content: schema.content.open({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'unknown-block-child',
      root: schema.content.type('parent', {
        default: { type: 'parent' },
        min: 1,
      }),
      unknown: 'preserve',
      version: 1,
    });
    const openEditor = createEditor({
      extensions: [Open],
      initialValue: [
        {
          children: [{ children: [{ text: 'x' }], type: 'unknown' }],
          type: 'parent',
        },
      ],
    });

    openEditor.update((tx) =>
      tx.text.insert('!', { at: { offset: 1, path: [0, 0, 0] } })
    );
    assert.equal(openEditor.read.text.string([]), 'x!');
  });

  it('rejects ambiguous and cyclic construction defaults', () => {
    const Ambiguous = defineEditorSchema('schema:ambiguous', {
      elements: {
        paragraph: { content: schema.content.text() } as const,
        section: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('paragraph')],
            { min: 1 }
          ),
        } as const,
      },
      id: 'ambiguous',
      root: schema.content.type('section'),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Ambiguous.name, Ambiguous.schema),
        ]),
      /needs an explicit default/
    );

    const Cyclic = defineEditorSchema('schema:cyclic', {
      elements: {
        a: {
          content: schema.content.type('b', { min: 1 }),
        } as const,
        b: {
          content: schema.content.type('a', { min: 1 }),
        } as const,
      },
      id: 'cyclic',
      root: schema.content.type('a', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([record(Cyclic.name, Cyclic.schema)]),
      /(?:a -> b -> a|b -> a -> b)/
    );
  });

  it('compiles placement-aware property targets, lifecycle, and merge lookup', () => {
    const Article = defineEditorSchema('schema:article', {
      elements: {
        paragraph: {
          content: schema.content.text(),
          groups: ['taggable'],
          properties: {
            shared: property.set(property.string()),
          },
        } as const,
        section: {
          content: schema.content.type('paragraph'),
          properties: { shared: property.string() },
        } as const,
      },
      groups: { taggable: {} as const },
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
      root: schema.content.type('section'),
      roots: {
        comments: schema.content.type('paragraph'),
      },
      unknown: 'reject',
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

  it('compiles exclusive text-property groups into symmetric conflict maps', () => {
    const ScriptPosition = schema.property.exclusive('plate:script-position');
    const Article = defineEditorSchema('schema:article', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      id: 'article',
      properties: [
        schema.textProperty('subscript', property.boolean(), {
          exclusive: [ScriptPosition],
        }),
        schema.textProperty('superscript', property.boolean(), {
          exclusive: [ScriptPosition],
        }),
      ],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const compiled = compileEditorSchemaContributions([
      record(Article.name, Article.schema),
    ]);
    const subscript = resolveCompiledSchemaProperty(
      compiled,
      'text',
      'subscript',
      { root: null, type: 'paragraph' }
    )!;
    const superscript = resolveCompiledSchemaProperty(
      compiled,
      'text',
      'superscript',
      { root: null, type: 'paragraph' }
    )!;

    assert.deepEqual(subscript.exclusiveGroupIds, ['plate:script-position']);
    assert.deepEqual(
      [
        ...compiled.properties.membersByExclusiveGroup.get(
          'plate:script-position'
        )!,
      ],
      [subscript.id, superscript.id]
    );
    assert.deepEqual(
      [...compiled.properties.conflictsByPropertyId.get(subscript.id)!],
      [superscript.id]
    );
    assert.deepEqual(
      [...compiled.properties.conflictsByPropertyId.get(superscript.id)!],
      [subscript.id]
    );
  });

  it('canonicalizes and validates raw set defaults at the compiler boundary', () => {
    const raw = (values: readonly unknown[]) =>
      ({
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: {
              tags: {
                default: values,
                item: {
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
        root: { allowed: { kind: 'type', type: 'paragraph' } },
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
      properties: Parameters<typeof defineEditorSchema>[1]['properties']
    ) =>
      defineEditorSchema('schema:selectors', {
        elements: {
          paragraph: { content: schema.content.text() } as const,
          section: { content: schema.content.text() } as const,
        },
        id: 'selectors',
        properties,
        root: schema.content.type('paragraph'),
        unknown: 'reject',
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
      schema.textProperty(schema.key.prefix('comment_'), property.string()),
      schema.textProperty('comment_state', property.string()),
    ]);

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Overlap.name, Overlap.schema),
        ]),
      (error) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(
          error.diagnostics.map(({ code, extensions }) => ({
            code,
            extensions,
          })),
          [
            {
              code: 'property-selector-conflict',
              extensions: [Overlap.name],
            },
            {
              code: 'property-selector-conflict',
              extensions: [Overlap.name],
            },
          ]
        );

        return true;
      }
    );
  });

  it('rejects ownership conflicts, cycles, and unknown references with provenance', () => {
    const Article = createBasicSchema();
    const Duplicate = {
      elements: { paragraph: { content: schema.content.text() } },
    } as const;

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

    const Unknown = {
      properties: [
        schema.textProperty('bad', property.boolean(), {
          target: target.group('missing'),
        }),
      ],
    } as const;

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          record('unknown', Unknown),
        ]),
      /unknown group "missing"/
    );

    const Groups = defineEditorSchema('schema:groups', {
      elements: { paragraph: { content: schema.content.text() } as const },
      groups: {
        a: { extends: ['b'] } as const,
        b: { extends: ['a'] } as const,
      },
      id: 'groups',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([record(Groups.name, Groups.schema)]),
      /a -> b -> a/
    );
  });

  it('aggregates independent schema ownership conflicts', () => {
    const Article = createBasicSchema();
    const contribution = {
      elements: { quote: { content: schema.content.text() } },
      groups: { quoted: {} },
      roots: { comments: schema.content.type('paragraph') },
    } as const;

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(Article.name, Article.schema),
          record('conflict-a', contribution),
          record('conflict-b', contribution),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(
          error.diagnostics.map(({ code, extensions, path }) => ({
            code,
            extensions,
            path,
          })),
          [
            {
              code: 'duplicate-element-type',
              extensions: ['conflict-a', 'conflict-b'],
              path: 'elements.quote',
            },
            {
              code: 'duplicate-group',
              extensions: ['conflict-a', 'conflict-b'],
              path: 'groups.quoted',
            },
            {
              code: 'duplicate-root',
              extensions: ['conflict-a', 'conflict-b'],
              path: 'roots.comments.content',
            },
          ]
        );

        return true;
      }
    );
  });

  it('applies slice policy defaults and records compiler timing', () => {
    const Article = defineEditorSchema('schema:article', {
      elements: {
        image: {
          slice: { replaceWhenCovered: false },
          void: 'block',
        } as const,
        paragraph: { content: schema.content.text() } as const,
        quote: {
          content: schema.content.open(),
          slice: { preserveContext: true },
        } as const,
      },
      id: 'article',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
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
      [
        'atom',
        {
          atom: true,
          content: schema.content.text(),
          slice: { preserveContext: false },
        } as const,
      ],
      ['void', { slice: { preserveContext: true }, void: 'block' } as const],
    ] as const) {
      const Invalid = defineEditorSchema(
        `schema:invalid-${type}-slice-policy`,
        {
          elements: {
            invalid,
            paragraph: { content: schema.content.text() } as const,
          },
          id: `invalid-${type}-slice-policy`,
          root: schema.content.type('paragraph'),
          unknown: 'reject',
          version: 1,
        }
      );

      assert.throws(
        () =>
          compileEditorSchemaContributions([
            record(Invalid.name, Invalid.schema),
          ]),
        /cannot preserve slice context.*does not expose editable child content/i
      );
    }
  });

  it('reuses compiled schema while publishing a new descriptor identity', () => {
    const slot = defineExtensionSlot('article-schema');
    const create = () =>
      defineEditorSchema('schema:article', {
        elements: {
          paragraph: { content: schema.content.text() } as const,
        },
        id: 'article',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      });
    const editor = createEditor({
      extensions: [slot.of(create())] as const,
    });
    const before = getCompiledEditorSchema(editor)!;
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
    });
    editor.update.extensions.reconfigure(slot, create());

    assert.equal(getCompiledEditorSchema(editor), before);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision + 1
    );
    assert.equal(commits, 1);
  });

  it('reuses structural compilation while rebinding changed live schema state', () => {
    const slot = defineExtensionSlot('article-schema');
    const create = (validate: (value: unknown) => value is string) =>
      defineEditorSchema('schema:article', {
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: {
              label: property.string({
                validate,
                validationVersion: 1,
              }),
            },
          } as const,
        },
        id: 'article',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      });
    const rawEditor = createEditor();
    const events: string[] = [];
    const nonEmpty = (value: unknown): value is string =>
      typeof value === 'string' && value.length > 0;
    const anyString = (value: unknown): value is string =>
      typeof value === 'string';

    assert.equal(rawEditor.read.schema.identity().kind, 'derived');
    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    const editor = createEditor({
      extensions: [slot.of(create(nonEmpty))] as const,
    });
    const before = getCompiledEditorSchema(editor)!;
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
    });

    assert.deepEqual(
      events.filter((id) => id === 'schema-compile'),
      ['schema-compile']
    );
    assert.equal(editor.read.schema.identity(), before.identity);
    events.length = 0;

    editor.update.extensions.reconfigure(slot, create(anyString));

    const after = getCompiledEditorSchema(editor)!;
    const [propertyId] = after.properties.byId.keys();

    assert.deepEqual(
      events.filter((id) => id === 'schema-compile'),
      []
    );
    assert.notEqual(after, before);
    assert.equal(after.revision, before.revision);
    assert.equal(after.identity.fingerprint, before.identity.fingerprint);
    assert.equal(commits, 1);
    assert.equal(
      before.properties.byId.get(propertyId!)!.descriptor.validate?.(''),
      false
    );
    assert.equal(
      after.properties.byId.get(propertyId!)!.descriptor.validate?.(''),
      true
    );
    assert.equal(editor.read.schema.identity(), before.identity);
  });

  it('rebinds a changed live validator nested in a set descriptor', () => {
    const slot = defineExtensionSlot('article-schema');
    const create = (validate: (value: unknown) => value is string) =>
      defineEditorSchema('schema:article', {
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: {
              labels: property.set(
                property.json({
                  validate,
                  validationVersion: 1,
                })
              ),
            },
          } as const,
        },
        id: 'article',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      });
    const editor = createEditor({
      extensions: [
        slot.of(
          create(
            (value): value is string =>
              typeof value === 'string' && value.length > 0
          )
        ),
      ] as const,
    });
    const before = getCompiledEditorSchema(editor)!;
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
    });
    editor.update.extensions.reconfigure(
      slot,
      create((value): value is string => typeof value === 'string')
    );

    const after = getCompiledEditorSchema(editor)!;

    assert.notEqual(after, before);
    assert.equal(after.identity.fingerprint, before.identity.fingerprint);
    assert.equal(commits, 1);
  });

  it('derives a deterministic identity when no complete schema is named', () => {
    const first = compileEditorSchemaContributions([]);
    const second = compileEditorSchemaContributions([]);

    assert.deepEqual(first.identity, {
      fingerprint: first.identity.fingerprint,
      kind: 'derived',
    });
    assert.deepEqual(second.identity, first.identity);
  });

  it('keeps named lineage outside the semantic fingerprint', () => {
    const create = (id: string, version: number) =>
      defineEditorSchema('schema:derived', {
        elements: {
          paragraph: { content: schema.content.text() },
        },
        id,
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version,
      });
    const first = compileEditorSchemaContributions([
      record('first', create('article', 1).schema),
    ]);
    const second = compileEditorSchemaContributions([
      record('second', create('renamed-article', 9).schema),
    ]);

    assert.equal(first.identity.kind, 'named');
    assert.equal(second.identity.kind, 'named');
    assert.equal(first.identity.fingerprint, second.identity.fingerprint);
    assert.notDeepEqual(first.identity, second.identity);
  });
});
