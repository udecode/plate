import type { DefinitionOf } from '@platejs/core';
import { createBasePlugin } from '@platejs/core';
import { ContentSlice, type Descendant } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import Papa, { type ParseConfig } from 'papaparse';

export type CsvParseOptions = ParseConfig;

export type CsvPluginState = {
  /**
   * Percentage of tolerated errors compared with the number of rows.
   *
   * @default 0.25
   */
  errorTolerance: number;
  /**
   * Options passed to PapaParse.
   *
   * @default { header: true }
   * @see https://www.papaparse.com/docs#config
   */
  parseOptions: CsvParseOptions;
};

export type DeserializeCsvOptions = { data: string } & CsvParseOptions;

/** Enables support for deserializing CSV content into Plate nodes. */
export const CsvPlugin = createBasePlugin({
  name: KEYS.csv,
  initialState: (): CsvPluginState => ({
    errorTolerance: 0.25,
    parseOptions: { header: true },
  }),
})
  .extend(({ editor, store }) => ({
    api: () => ({
      deserialize: ({
        data,
        ...parseOptions
      }: DeserializeCsvOptions): Descendant[] | undefined => {
        const testCsv = Papa.parse<unknown[]>(data, {
          download: false,
          preview: 2,
          worker: false,
        });

        if (testCsv.errors.length > 0) return;

        const { errorTolerance = 0.25, parseOptions: configuredParseOptions } =
          store.get();
        const csv = Papa.parse<string[] | Record<string, string>>(data, {
          ...(configuredParseOptions
            ? {
                ...configuredParseOptions,
                delimitersToGuess: configuredParseOptions.delimitersToGuess
                  ? [...configuredParseOptions.delimitersToGuess]
                  : configuredParseOptions.delimitersToGuess,
              }
            : undefined),
          ...parseOptions,
          download: false,
          worker: false,
        });
        const tolerance = Math.max(0, errorTolerance);

        if (csv.data.length === 0) return;

        if (csv.meta.fields) {
          if (csv.meta.fields.length < 2) return;
        } else if (
          csv.data.length < 2 ||
          !Array.isArray(csv.data[0]) ||
          csv.data[0].length < 2 ||
          !Array.isArray(csv.data[1]) ||
          csv.data[1].length < 2
        ) {
          return;
        }

        if (
          csv.errors.length > 0 &&
          csv.errors.length > tolerance * csv.data.length
        ) {
          return;
        }

        const paragraph = editor.plugin(KEYS.p).type;
        const tablePlugin = editor.plugin(KEYS.table);
        const table = tablePlugin.installed ? tablePlugin.type : KEYS.table;
        const thPlugin = editor.plugin(KEYS.th);
        const th = thPlugin.installed ? thPlugin.type : KEYS.th;
        const trPlugin = editor.plugin(KEYS.tr);
        const tr = trPlugin.installed ? trPlugin.type : KEYS.tr;
        const tdPlugin = editor.plugin(KEYS.td);
        const td = tdPlugin.installed ? tdPlugin.type : KEYS.td;
        const fields = csv.meta.fields;
        const rows = fields
          ? [
              {
                children: fields.map((field) => ({
                  children: [{ children: [{ text: field }], type: paragraph }],
                  type: th,
                })),
                type: tr,
              },
              ...csv.data.flatMap((row) =>
                Array.isArray(row)
                  ? []
                  : [
                      {
                        children: fields.map((field) => ({
                          children: [
                            {
                              children: [{ text: row[field] || '' }],
                              type: paragraph,
                            },
                          ],
                          type: td,
                        })),
                        type: tr,
                      },
                    ]
              ),
            ]
          : csv.data.flatMap((row) =>
              Array.isArray(row)
                ? [
                    {
                      children: row.map((cell) => ({
                        children: [
                          { children: [{ text: cell }], type: paragraph },
                        ],
                        type: td,
                      })),
                      type: tr,
                    },
                  ]
                : []
            );

        return [
          { children: [{ text: '' }], type: paragraph },
          { children: rows, type: table },
          { children: [{ text: '' }], type: paragraph },
        ];
      },
    }),
  }))
  .extend(({ api, defineCodecs }) => ({
    codecs: defineCodecs({
      'text/plain': {
        priority: 20,
        scope: 'document',
        decode: ({ data }) => {
          const content = api.deserialize({ data });

          return content ? ContentSlice.closed(content) : null;
        },
      },
    }),
  }));

export type CsvDefinition = DefinitionOf<typeof CsvPlugin>;
