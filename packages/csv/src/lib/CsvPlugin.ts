import type { DefinitionOf } from '@platejs/core';
import { defineBasePlugin } from '@platejs/core';
import { ContentSlice, type Descendant } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
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
export const CsvPlugin = defineBasePlugin(PLUGINS.csv, {
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

        if (testCsv.errors.length > 0) return undefined;

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

        if (csv.data.length === 0) return undefined;

        if (csv.meta.fields) {
          if (csv.meta.fields.length < 2) return undefined;
        } else if (
          csv.data.length < 2 ||
          !Array.isArray(csv.data[0]) ||
          csv.data[0].length < 2 ||
          !Array.isArray(csv.data[1]) ||
          csv.data[1].length < 2
        ) {
          return undefined;
        }

        if (
          csv.errors.length > 0 &&
          csv.errors.length > tolerance * csv.data.length
        ) {
          return undefined;
        }

        const paragraphPlugin = editor.plugin(PLUGINS.paragraph);
        const paragraph = paragraphPlugin.schema.type;
        const tablePlugin = editor.plugin(PLUGINS.table);
        const table = tablePlugin.schema.type;
        const trPlugin = editor.plugin(PLUGINS.tableRow);
        const tr = trPlugin.schema.type;
        const tdPlugin = editor.plugin(PLUGINS.tableCell);
        const td = tdPlugin.schema.type;
        const { fields } = csv.meta;
        const rows = fields
          ? [
              {
                children: fields.map((field) => ({
                  children: [{ children: [{ text: field }], type: paragraph }],
                  header: true,
                  type: td,
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
