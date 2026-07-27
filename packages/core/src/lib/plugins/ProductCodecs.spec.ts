import { describe, expect, it, spyOn } from 'bun:test';

import { ContentSlice, property, schema } from '@platejs/plite';
import { getExtensionRegistry } from '@platejs/plite/internal';
import { writeHostFragmentData } from '@platejs/plite-dom';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from '../plugin';

const createParagraph = (text: string) => ({
  children: [{ text }],
  type: 'p',
});

const createDataTransfer = (format: string, data: string) => {
  const transfer = new DataTransfer();

  transfer.setData(format, data);

  return transfer;
};

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state += 0x6d_2b_79_f5;
    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const seededShuffle = <T>(values: readonly T[], seed: number) => {
  const random = createSeededRandom(seed);
  const result = [...values];

  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));

    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }

  return result;
};

describe('product codecs', () => {
  it('derives ordinary ownership from the owning plugin schema', () => {
    const CardPlugin = createBasePlugin({
      key: 'cardCodec',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { tone: property.string() },
        },
      },
      type: 'card',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-card': {
            decode: ({ data }) =>
              ContentSlice.closed([
                { children: [{ text: data }], type: 'card' },
              ]),
          },
        }),
    });
    const editor = createBaseEditor({ plugins: [CardPlugin] });

    expect(
      editor.api.clipboard.insertData(
        createDataTransfer('application/x-card', 'derived')
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'derived' }], type: 'card' },
    ]);
  });

  it('orders document codecs independently of plugin declaration order', () => {
    const calls: string[] = [];
    const LowerPlugin = createBasePlugin({
      key: 'lowerCodec',
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'application/x-fallback': {
          priority: 1000,
          scope: 'document',
          decode: ({ data }) => {
            calls.push('lower');

            return ContentSlice.closed([createParagraph(`lower:${data}`)]);
          },
        },
      }),
    }));
    const HigherPlugin = createBasePlugin({
      key: 'higherCodec',
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'application/x-fallback': {
          priority: 2000,
          scope: 'document',
          decode: () => {
            calls.push('higher');

            return null;
          },
        },
      }),
    }));

    for (const plugins of [
      [LowerPlugin, HigherPlugin],
      [HigherPlugin, LowerPlugin],
    ]) {
      calls.length = 0;
      const editor = createBaseEditor({ plugins });

      expect(
        editor.api.clipboard.insertData(
          createDataTransfer('application/x-fallback', 'value')
        )
      ).toBe(true);
      expect(editor.read.children()).toEqual([createParagraph('lower:value')]);
      expect(calls).toEqual(['higher', 'lower']);
    }
  });

  it('allows disjoint equal-priority claims with a stable owner tie-break', () => {
    const AlphaPlugin = createBasePlugin({
      key: 'alphaCodec',
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-disjoint': {
            decode: () => ContentSlice.closed([createParagraph('alpha')]),
          },
        }),
    });
    const ZuluPlugin = createBasePlugin({
      key: 'zuluCodec',
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-disjoint': {
            decode: () => ContentSlice.closed([createParagraph('zulu')]),
          },
        }),
    });

    for (const plugins of [
      [AlphaPlugin, ZuluPlugin],
      [ZuluPlugin, AlphaPlugin],
    ]) {
      const editor = createBaseEditor({ plugins });

      expect(
        editor.api.clipboard.insertData(
          createDataTransfer('application/x-disjoint', 'value')
        )
      ).toBe(true);
      expect(editor.read.children()).toEqual([createParagraph('alpha')]);
    }
  });

  it('orders formats independently of codec object enumeration', () => {
    const createFormatPlugin = (reverse: boolean) =>
      createBasePlugin({
        key: reverse ? 'reverseFormats' : 'forwardFormats',
        codecs: ({ defineCodecs }) =>
          defineCodecs(
            reverse
              ? {
                  'application/x-order-z': {
                    scope: 'document',
                    encode: () => 'z',
                  },
                  'application/x-order-a': {
                    scope: 'document',
                    encode: () => 'a',
                  },
                }
              : {
                  'application/x-order-a': {
                    scope: 'document',
                    encode: () => 'a',
                  },
                  'application/x-order-z': {
                    scope: 'document',
                    encode: () => 'z',
                  },
                }
          ),
      });
    const results = [false, true].map((reverse) => {
      const editor = createBaseEditor({
        plugins: [createFormatPlugin(reverse)],
      });
      const transfer = new DataTransfer();

      return writeHostFragmentData(
        editor,
        transfer,
        ContentSlice.closed([createParagraph('value')])
      ).filter((format) => format.startsWith('application/x-order-'));
    });

    expect(results).toEqual([
      ['application/x-order-a', 'application/x-order-z'],
      ['application/x-order-a', 'application/x-order-z'],
    ]);
  });

  it('preserves compiler order across seeded plugin permutations', () => {
    const calls: string[] = [];
    const definitions = [
      { codecPriority: 40, key: 'generatedA' },
      { codecPriority: 50, key: 'generatedB' },
      { codecPriority: 30, key: 'generatedC' },
      { codecPriority: 20, key: 'generatedD' },
      { codecPriority: 10, key: 'generatedE' },
    ] as const;
    const plugins = definitions.map(({ codecPriority, key }, index) =>
      createBasePlugin({ key }).extend(({ defineCodecs }) => ({
        codecs: defineCodecs({
          'application/x-generated-order': {
            priority: codecPriority,
            scope: 'document',
            decode: ({ data }) => {
              calls.push(key);

              return index === definitions.length - 1
                ? ContentSlice.closed([createParagraph(`winner:${data}`)])
                : null;
            },
          },
        }),
      }))
    );

    for (let seed = 1; seed <= 32; seed++) {
      calls.length = 0;
      const editor = createBaseEditor({
        plugins: seededShuffle(plugins, seed),
      });

      expect(
        editor.api.clipboard.insertData(
          createDataTransfer('application/x-generated-order', String(seed))
        )
      ).toBe(true);
      expect(calls).toEqual([
        'generatedB',
        'generatedA',
        'generatedC',
        'generatedD',
        'generatedE',
      ]);
      expect(editor.read.children()).toEqual([
        createParagraph(`winner:${seed}`),
      ]);
    }
  });

  it('accepts generated disjoint claims and rejects generated overlaps', () => {
    for (let width = 2; width <= 6; width++) {
      const format = `application/x-generated-claims-${width}`;
      const disjoint = Array.from({ length: width }, (_, index) =>
        createBasePlugin({
          key: `generatedDisjoint${width}-${index}`,
          schema: {
            mark: property.boolean({ default: false, omitDefault: true }),
          },
          codecs: ({ defineCodecs }) =>
            defineCodecs({
              [format]: {
                decode: () =>
                  index === 0
                    ? ContentSlice.closed([
                        createParagraph(`disjoint:${width}`),
                      ])
                    : null,
              },
            }),
        })
      );
      const editor = createBaseEditor({
        plugins: seededShuffle(disjoint, width * 97),
      });

      expect(
        editor.api.clipboard.insertData(createDataTransfer(format, 'value'))
      ).toBe(true);
      expect(editor.read.children()).toEqual([
        createParagraph(`disjoint:${width}`),
      ]);

      const propertyOwner = createBasePlugin({
        key: `generatedPropertyOwner${width}`,
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
        codecs: ({ defineCodecs }) =>
          defineCodecs({
            [format]: {
              decode: () => null,
            },
          }),
      });
      const documentOwner = createBasePlugin({
        key: `generatedDocumentOwner${width}`,
        codecs: ({ defineCodecs }) =>
          defineCodecs({
            [format]: {
              scope: 'document',
              decode: () => null,
            },
          }),
      });

      expect(() =>
        createBaseEditor({
          plugins: seededShuffle([propertyOwner, documentOwner], width * 193),
        })
      ).toThrow('equal priority and competing decode claims');
    }
  });

  it('rejects equal-priority competing document claims', () => {
    const FirstPlugin = createBasePlugin({
      key: 'firstCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-conflict': {
            scope: 'document',
            decode: () => ContentSlice.closed([createParagraph('first')]),
          },
        }),
    });
    const SecondPlugin = createBasePlugin({
      key: 'secondCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-conflict': {
            scope: 'document',
            decode: () => ContentSlice.closed([createParagraph('second')]),
          },
        }),
    });

    expect(() =>
      createBaseEditor({ plugins: [FirstPlugin, SecondPlugin] })
    ).toThrow(
      'Plate codecs "firstCodec/application/x-conflict" and "secondCodec/application/x-conflict" have equal priority and competing decode claims.'
    );
  });

  it('rejects split declarations for one owner and format', () => {
    const SplitPlugin = createBasePlugin({
      key: 'splitCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-split': {
            scope: 'document',
            decode: () => ContentSlice.closed([createParagraph('decode')]),
          },
        }),
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'application/x-split': {
          scope: 'document',
          encode: () => 'encode',
        },
      }),
    }));

    expect(() => createBaseEditor({ plugins: [SplitPlugin] })).toThrow(
      'Plate codec owner "splitCodec" must declare "application/x-split" once with decode and encode in the same object.'
    );
  });

  it('rejects public identity fields and non-callable callbacks', () => {
    for (const field of ['key', 'owner', 'target'] as const) {
      const InvalidPlugin = createBasePlugin({
        key: `invalid-${field}`,
        codecs: ({ defineCodecs }) =>
          defineCodecs({
            'application/x-invalid': {
              decode: () => null,
              [field]: 'public-identity',
              scope: 'document',
            },
          } as never),
      });

      expect(() => createBaseEditor({ plugins: [InvalidPlugin] })).toThrow(
        `Plate codec "invalid-${field}/application/x-invalid" has unknown field "${field}".`
      );
    }

    const InvalidCallbackPlugin = createBasePlugin({
      key: 'invalidCallback',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-invalid': {
            decode: true,
            scope: 'document',
          },
        } as never),
    });

    expect(() =>
      createBaseEditor({ plugins: [InvalidCallbackPlugin] })
    ).toThrow(
      'Plate codec "invalidCallback/application/x-invalid" field "decode" must be a function.'
    );
  });

  it('rejects malformed author callbacks and codec descriptors', () => {
    const InvalidAuthorCallbackPlugin = createBasePlugin({
      key: 'invalidAuthorCallback',
      // @plate-schema-adoption-negative-codec
      codecs: (() => null) as never,
    });

    expect(() =>
      createBaseEditor({ plugins: [InvalidAuthorCallbackPlugin] })
    ).toThrow('Plate plugin `codecs` must be a MIME-keyed object.');

    const InvalidDescriptorPlugin = createBasePlugin({
      key: 'invalidDescriptor',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-invalid': null,
        } as never),
    });

    expect(() =>
      createBaseEditor({ plugins: [InvalidDescriptorPlugin] })
    ).toThrow(
      'Plate codec "invalidDescriptor/application/x-invalid" must be an object.'
    );

    const MissingDirectionPlugin = createBasePlugin({
      key: 'missingDirection',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-invalid': {
            scope: 'document',
          },
        } as never),
    });

    expect(() =>
      createBaseEditor({ plugins: [MissingDirectionPlugin] })
    ).toThrow(
      'Plate codec "missingDirection/application/x-invalid" must define decode or encode.'
    );

    const InvalidFormatPlugin = createBasePlugin({
      key: 'invalidFormat',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          invalid: {
            scope: 'document',
            decode: () => null,
          },
        }),
    });

    expect(() => createBaseEditor({ plugins: [InvalidFormatPlugin] })).toThrow(
      'Plate codec owner "invalidFormat" must use a MIME format key.'
    );

    const InvalidScopePlugin = createBasePlugin({
      key: 'invalidScope',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-invalid': {
            scope: 'node',
            decode: () => null,
          },
        } as never),
    });

    expect(() => createBaseEditor({ plugins: [InvalidScopePlugin] })).toThrow(
      'Plate codec owner "invalidScope" has unknown scope "node".'
    );

    const InvalidPriorityPlugin = createBasePlugin({
      key: 'invalidPriority',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-invalid': {
            priority: Number.NaN,
            scope: 'document',
            decode: () => null,
          },
        }),
    });

    expect(() =>
      createBaseEditor({ plugins: [InvalidPriorityPlugin] })
    ).toThrow(
      'Plate codec "invalidPriority/application/x-invalid" priority must be finite.'
    );

    const MissingClaimPlugin = createBasePlugin({
      key: 'missingClaim',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-invalid': {
            decode: () => null,
          },
        }),
    });

    expect(() => createBaseEditor({ plugins: [MissingClaimPlugin] })).toThrow(
      'Plate codec owner "missingClaim" must declare an element or property schema binding, or use document scope.'
    );
  });

  it('rejects array decode output and delegates to the next codec', () => {
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    const FallbackPlugin = createBasePlugin({
      key: 'arrayFallback',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-array': {
            scope: 'document',
            decode: ({ data }) =>
              ContentSlice.closed([createParagraph(`fallback:${data}`)]),
          },
        }),
    });
    const ArrayPlugin = createBasePlugin({
      key: 'arrayCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-array': {
            priority: 20,
            scope: 'document',
            decode: () => [createParagraph('invalid')],
          },
        } as never),
    });
    const editor = createBaseEditor({
      plugins: [FallbackPlugin, ArrayPlugin],
    });

    expect(
      editor.api.clipboard.insertData(
        createDataTransfer('application/x-array', 'value')
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([createParagraph('fallback:value')]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it('isolates callback failures and delegates each direction exactly once', () => {
    const calls: Record<string, number> = {};
    let declarationCalls = 0;
    const count = (key: string) => {
      calls[key] = (calls[key] ?? 0) + 1;
    };
    const QueryThrowPlugin = createBasePlugin({
      key: 'queryThrowCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 70,
            scope: 'document',
            query: () => {
              count('queryThrow.query');

              throw new Error('query failure');
            },
            decode: () => {
              count('queryThrow.decode');

              return ContentSlice.closed([createParagraph('unreachable')]);
            },
          },
        }),
      };
    });
    const QueryFalsePlugin = createBasePlugin({
      key: 'queryFalseCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 60,
            scope: 'document',
            query: () => {
              count('queryFalse.query');

              return false;
            },
            decode: () => {
              count('queryFalse.decode');

              return ContentSlice.closed([createParagraph('unreachable')]);
            },
          },
        }),
      };
    });
    const DecodeThrowPlugin = createBasePlugin({
      key: 'decodeThrowCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 50,
            scope: 'document',
            decode: () => {
              count('decodeThrow');

              throw new Error('decode failure');
            },
          },
        }),
      };
    });
    const DecodeNullPlugin = createBasePlugin({
      key: 'decodeNullCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 40,
            scope: 'document',
            decode: () => {
              count('decodeNull');

              return null;
            },
          },
        }),
      };
    });
    const DecodeFallbackPlugin = createBasePlugin({
      key: 'decodeFallbackCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 30,
            scope: 'document',
            decode: ({ data }) => {
              count('decodeFallback');

              return ContentSlice.closed([createParagraph(`fallback:${data}`)]);
            },
          },
        }),
      };
    });
    const EncodeThrowPlugin = createBasePlugin({
      key: 'encodeThrowCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 50,
            scope: 'document',
            encode: () => {
              count('encodeThrow');

              throw new Error('encode failure');
            },
          },
        }),
      };
    });
    const EncodeNullPlugin = createBasePlugin({
      key: 'encodeNullCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 40,
            scope: 'document',
            encode: () => {
              count('encodeNull');

              return null;
            },
          },
        }),
      };
    });
    const EncodeFallbackPlugin = createBasePlugin({
      key: 'encodeFallbackCodec',
    }).extend(({ defineCodecs }) => {
      declarationCalls++;

      return {
        codecs: defineCodecs({
          'application/x-delegation': {
            priority: 30,
            scope: 'document',
            encode: () => {
              count('encodeFallback');

              return 'encoded:fallback';
            },
          },
        }),
      };
    });
    const editor = createBaseEditor({
      plugins: [
        EncodeFallbackPlugin,
        DecodeNullPlugin,
        QueryThrowPlugin,
        EncodeThrowPlugin,
        DecodeFallbackPlugin,
        QueryFalsePlugin,
        EncodeNullPlugin,
        DecodeThrowPlugin,
      ],
    });
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(
        editor.api.clipboard.insertData(
          createDataTransfer('application/x-delegation', 'value')
        )
      ).toBe(true);
      expect(editor.read.children()).toEqual([
        createParagraph('fallback:value'),
      ]);

      const transfer = new DataTransfer();

      expect(
        writeHostFragmentData(
          editor,
          transfer,
          ContentSlice.closed([createParagraph('encode')])
        )
      ).toContain('application/x-delegation');
      expect(transfer.getData('application/x-delegation')).toBe(
        'encoded:fallback'
      );
      expect(declarationCalls).toBe(8);
      expect(calls).toEqual({
        decodeFallback: 1,
        decodeNull: 1,
        decodeThrow: 1,
        encodeFallback: 1,
        encodeNull: 1,
        encodeThrow: 1,
        'queryFalse.query': 1,
        'queryThrow.query': 1,
      });
      expect(errorSpy).toHaveBeenCalledTimes(3);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('round-trips one exact open rooted slice through one bidirectional registration', () => {
    let decodedSlice: unknown;
    let encodedSlice: unknown;
    const calls = { decode: 0, encode: 0 };
    const RecordsPlugin = createBasePlugin({
      key: 'recordsCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-records': {
            scope: 'document',
            decode: ({ data }) => {
              calls.decode++;
              decodedSlice = ContentSlice.fromJSON(JSON.parse(data));

              return decodedSlice as ReturnType<typeof ContentSlice.fromJSON>;
            },
            encode: ({ slice }) => {
              calls.encode++;
              encodedSlice = slice;

              return JSON.stringify(slice);
            },
          },
        }),
    });
    const editor = createBaseEditor({
      initialValue: [createParagraph('initial')],
      plugins: [RecordsPlugin],
    });
    const transfer = new DataTransfer();
    const slice = ContentSlice.fromJSON({
      content: [createParagraph('record')],
      openEnd: 1,
      openStart: 1,
      roots: {
        'note:1': [createParagraph('detached')],
      },
    });

    expect(writeHostFragmentData(editor, transfer, slice)).toContain(
      'application/x-records'
    );
    expect(JSON.parse(transfer.getData('application/x-records'))).toEqual(
      slice
    );
    expect(encodedSlice).toBe(slice);
    expect(editor.api.clipboard.insertData(transfer)).toBe(true);
    expect(decodedSlice).toEqual(slice);
    expect(calls).toEqual({ decode: 1, encode: 1 });

    const registrations = (getExtensionRegistry(editor).capabilities.get(
      'host.codecs'
    ) ?? []) as readonly {
      codec: {
        format: string;
        key: string;
        parse?: unknown;
        serialize?: unknown;
      };
    }[];
    const recordRegistrations = registrations.filter(
      ({ codec }) => codec.format === 'application/x-records'
    );

    expect(recordRegistrations).toHaveLength(1);
    expect(recordRegistrations[0]?.codec).toMatchObject({
      format: 'application/x-records',
      key: 'plate:application/x-records',
      parse: expect.any(Function),
      serialize: expect.any(Function),
    });
  });

  it('round-trips a seeded corpus of exact rooted and open slices', () => {
    for (let seed = 1; seed <= 24; seed++) {
      const format = `application/x-generated-slice-${seed}`;
      let decodedSlice: unknown;
      const CodecPlugin = createBasePlugin({
        key: `generatedSliceCodec${seed}`,
        codecs: ({ defineCodecs }) =>
          defineCodecs({
            [format]: {
              scope: 'document',
              decode: ({ data }) => {
                const decoded = ContentSlice.fromJSON(JSON.parse(data));

                decodedSlice = decoded;

                return decoded;
              },
              encode: ({ slice }) => JSON.stringify(slice),
            },
          }),
      });
      const editor = createBaseEditor({
        initialValue: [createParagraph('initial')],
        plugins: [CodecPlugin],
      });
      const transfer = new DataTransfer();
      const openStart = seed % 2;
      const openEnd = Math.floor(seed / 2) % 2;
      const rootCount = seed % 4;
      const roots = Object.fromEntries(
        Array.from({ length: rootCount }, (_, index) => [
          `note:${seed}:${index}`,
          [createParagraph(`detached:${seed}:${index}`)],
        ])
      );
      const slice = ContentSlice.fromJSON({
        content: [createParagraph(`main:${seed}`)],
        openEnd,
        openStart,
        ...(rootCount > 0 ? { roots } : {}),
      });

      expect(writeHostFragmentData(editor, transfer, slice)).toContain(format);
      expect(JSON.parse(transfer.getData(format))).toEqual(slice);
      expect(editor.api.clipboard.insertData(transfer)).toBe(true);
      expect(decodedSlice).toEqual(slice);
    }
  });

  it('does not publish malformed host data or decoded slice shapes', () => {
    let decodeCalls = 0;
    const MalformedPlugin = createBasePlugin({
      key: 'malformedCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'application/x-malformed': {
            scope: 'document',
            decode: ({ data }) => {
              decodeCalls++;

              return JSON.parse(data);
            },
          },
        }),
    });
    const initialValue = [createParagraph('initial')];
    const editor = createBaseEditor({
      initialValue,
      plugins: [MalformedPlugin],
    });
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(
        editor.api.clipboard.insertData(
          createDataTransfer('application/x-malformed', '{')
        )
      ).toBe(false);
      expect(
        editor.api.clipboard.insertData(
          createDataTransfer(
            'application/x-malformed',
            JSON.stringify([createParagraph('array')])
          )
        )
      ).toBe(false);
      expect(editor.read.children()).toEqual(initialValue);
      expect(decodeCalls).toBe(2);
      expect(errorSpy).toHaveBeenCalledTimes(2);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('fuzzes malformed host data without publishing a document change', () => {
    const format = 'application/x-generated-malformed';
    let decodeCalls = 0;
    const MalformedPlugin = createBasePlugin({
      key: 'generatedMalformedCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          [format]: {
            scope: 'document',
            decode: ({ data }) => {
              decodeCalls++;

              return ContentSlice.fromJSON(JSON.parse(data));
            },
          },
        }),
    });
    const initialValue = [createParagraph('initial')];
    const editor = createBaseEditor({
      initialValue,
      plugins: [MalformedPlugin],
    });
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    try {
      const random = createSeededRandom(0xc_04);
      const valid = JSON.stringify(
        ContentSlice.closed([createParagraph('never published')])
      );
      const malformed = Array.from({ length: 32 }, () => {
        const prefix = String.fromCharCode(
          65 + Math.floor(random() * ('Z'.charCodeAt(0) - 64))
        );

        return `${prefix}${valid}`;
      });

      for (const data of malformed) {
        const version = editor.read.runtime.snapshot().version;

        expect(
          editor.api.clipboard.insertData(createDataTransfer(format, data))
        ).toBe(false);
        expect(editor.read.runtime.snapshot().version).toBe(version);
        expect(editor.read.children()).toEqual(initialValue);
      }
      expect(decodeCalls).toBe(malformed.length);
      expect(errorSpy).toHaveBeenCalledTimes(malformed.length);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('falls back to plain-text insertion when codecs return null', () => {
    const NullPlugin = createBasePlugin({
      key: 'nullCodec',
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/plain': {
            priority: 20,
            scope: 'document',
            decode: () => null,
          },
        }),
    });
    const editor = createBaseEditor({
      initialValue: [createParagraph('initial')],
      plugins: [NullPlugin],
    });

    expect(
      editor.api.clipboard.insertData(createDataTransfer('text/plain', 'hello'))
    ).toBe(true);
    expect(editor.read.children()).toEqual([createParagraph('initialhello')]);
  });
});
