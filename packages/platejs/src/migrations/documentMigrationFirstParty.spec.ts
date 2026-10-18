import { AIChatPlugin } from '../ai/react/AIChatPlugin';
import { BaseExcalidrawPlugin } from '../excalidraw/lib/BaseExcalidrawPlugin';
import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
} from '../features/basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../features/basic-nodes/lib/BaseHeadingPlugins';
import { BaseScriptPlugin } from '../features/basic-nodes/lib/BaseMarkPlugins';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../features/basic-styles/lib/BaseStylePlugins';
import { BaseCalloutPlugin } from '../features/callout/lib/BaseCalloutPlugin';
import { BaseCodeBlockPlugin } from '../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseDatePlugin } from '../features/date/lib/BaseDatePlugin';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../features/details/lib/BaseDetailsPlugin';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../features/footnote/lib/BaseFootnotePlugin';
import { BaseIndentPlugin } from '../features/indent/lib/BaseIndentPlugin';
import {
  BaseColumnGroupPlugin,
  BaseColumnItemPlugin,
} from '../features/layout/lib/BaseColumnPlugin';
import { BaseLinkPlugin } from '../features/link/lib/BaseLinkPlugin';
import { BaseListPlugin } from '../features/list/lib/BaseListPlugin';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
} from '../features/media/lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../features/media/lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../features/media/lib/media-embed/BaseMediaEmbedPlugin';
import { BaseMentionPlugin } from '../features/mention/lib/BaseMentionPlugin';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../features/table/lib/BaseTablePlugin';
import { BaseTocPlugin } from '../features/toc/lib/BaseTocPlugin';
import { ElementIdPlugin } from '../lib/plugins/element-id/ElementIdPlugin';
import { BaseParagraphPlugin } from '../lib/plugins/paragraph/BaseParagraphPlugin';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from '../math/lib/BaseEquationPlugin';
import { LineHeightPlugin } from '../react/features/basic-styles/BasicStylePlugins';
import { ColumnGroupPlugin } from '../react/features/layout/ColumnPlugin';
import { ListPlugin } from '../react/features/list/ListPlugin';
import { TablePlugin } from '../react/features/table/TablePlugin';
import { getFirstPartyBinding } from './documentMigrationFirstParty.internal';
import {
  defineDocumentMigrations,
  migrateDocument,
} from './documentMigrations';
import { V53_FIRST_PARTY_IDENTITIES } from './v53-manifest.internal';

const shippedPlugins = {
  aiChat: AIChatPlugin,
  audio: BaseAudioPlugin,
  blockquote: BaseBlockquotePlugin,
  callout: BaseCalloutPlugin,
  codeBlock: BaseCodeBlockPlugin,
  column: BaseColumnItemPlugin,
  columnGroup: BaseColumnGroupPlugin,
  date: BaseDatePlugin,
  details: BaseDetailsPlugin,
  detailsSummary: BaseDetailsSummaryPlugin,
  elementId: ElementIdPlugin,
  equation: BaseEquationPlugin,
  excalidraw: BaseExcalidrawPlugin,
  file: BaseFilePlugin,
  footnote: BaseFootnotePlugin,
  footnoteDefinition: BaseFootnoteDefinitionPlugin,
  heading: BaseHeadingPlugin,
  horizontalRule: BaseHorizontalRulePlugin,
  image: BaseImagePlugin,
  indent: BaseIndentPlugin,
  inlineEquation: BaseInlineEquationPlugin,
  lineHeight: BaseLineHeightPlugin,
  link: BaseLinkPlugin,
  list: BaseListPlugin,
  mediaEmbed: BaseMediaEmbedPlugin,
  mention: BaseMentionPlugin,
  paragraph: BaseParagraphPlugin,
  script: BaseScriptPlugin,
  table: BaseTablePlugin,
  tableCell: BaseTableCellPlugin,
  tableRow: BaseTableRowPlugin,
  textAlign: BaseTextAlignPlugin,
  toc: BaseTocPlugin,
  video: BaseVideoPlugin,
} as const;

const ownersWithoutShippedPlugin = new Set(['codeLine', 'tag', 'toggle']);

const resolvedNames = new Set([
  ...V53_FIRST_PARTY_IDENTITIES.flatMap((entry) =>
    entry.kind.startsWith('element-')
      ? ['owner' in entry ? entry.owner : entry.identity]
      : []
  ),
  'detailsSummary',
  'elementId',
  'footnoteDefinition',
  'indent',
  'lineHeight',
  'list',
  'script',
  'table',
  'textAlign',
]);

const installedBuiltInName = (plugin: object, builtInName: string) => {
  let name: string | undefined;

  migrateDocument(
    { children: [{ children: [{ text: '' }], type: 'paragraph' }] },
    {
      migrations: defineDocumentMigrations({
        plugins: [BaseParagraphPlugin, plugin as typeof BaseParagraphPlugin],
        schema: { id: 'first-party', version: 54 },
        steps: {
          54: ({ document, target }) => {
            name = getFirstPartyBinding(target, builtInName)?.name;

            return { document };
          },
        },
      }),
      source: 53,
    }
  );

  return name;
};

describe('first-party plugins in a document migration target', () => {
  it('has a shipped plugin for every built-in name the v54 step resolves', () => {
    const missing = [...resolvedNames].filter(
      (name) =>
        !ownersWithoutShippedPlugin.has(name) && !(name in shippedPlugins)
    );

    expect(missing).toEqual([]);
  });

  it.each(Object.entries(shippedPlugins))(
    'recognizes the installed %s plugin',
    (builtInName, plugin) => {
      expect(installedBuiltInName(plugin, builtInName)).toBe(builtInName);
    }
  );

  it.each([
    ['lineHeight', LineHeightPlugin],
    ['lineHeight', BaseLineHeightPlugin.configure({ options: {} })],
    ['list', ListPlugin],
    ['table', TablePlugin],
    ['columnGroup', ColumnGroupPlugin],
  ] as const)(
    'recognizes a React or configured %s plugin',
    (builtInName, plugin) => {
      expect(installedBuiltInName(plugin, builtInName)).toBe(builtInName);
    }
  );
});
