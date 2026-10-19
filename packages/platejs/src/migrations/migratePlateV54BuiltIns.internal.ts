import { BaseExcalidrawPlugin } from '../excalidraw';
import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseScriptPlugin,
} from '../features/basic-nodes';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../features/basic-styles';
import { BaseCalloutPlugin } from '../features/callout';
import { BaseCodeBlockPlugin } from '../features/code-block';
import { BaseDatePlugin } from '../features/date';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../features/details';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../features/footnote';
import { BaseIndentPlugin } from '../features/indent';
import {
  BaseColumnGroupPlugin,
  BaseColumnItemPlugin,
} from '../features/layout';
import { BaseLinkPlugin } from '../features/link';
import { BaseListPlugin } from '../features/list';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../features/media';
import { BaseMentionPlugin } from '../features/mention';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../features/table';
import { BaseTocPlugin } from '../features/toc';
import { BaseParagraphPlugin } from '../lib/plugins/paragraph/BaseParagraphPlugin';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../math/lib';
import type { DocumentMigrationTarget } from './documentMigrations';
import { getMigrationBinding } from './documentMigrationTarget.internal';
import type { V53ElementOwner } from './v53-manifest.internal';

type V53OwnerWithoutPlugin = 'aiChat' | 'codeLine' | 'tag' | 'toggle';

const V53_OWNER_PLUGINS: {
  readonly [TOwner in V53ElementOwner]: TOwner extends V53OwnerWithoutPlugin
    ? null
    : Readonly<{ name: TOwner }>;
} = {
  aiChat: null,
  audio: BaseAudioPlugin,
  blockquote: BaseBlockquotePlugin,
  callout: BaseCalloutPlugin,
  codeBlock: BaseCodeBlockPlugin,
  codeLine: null,
  column: BaseColumnItemPlugin,
  columnGroup: BaseColumnGroupPlugin,
  date: BaseDatePlugin,
  equation: BaseEquationPlugin,
  excalidraw: BaseExcalidrawPlugin,
  file: BaseFilePlugin,
  footnote: BaseFootnotePlugin,
  footnoteDefinition: BaseFootnoteDefinitionPlugin,
  heading: BaseHeadingPlugin,
  horizontalRule: BaseHorizontalRulePlugin,
  image: BaseImagePlugin,
  inlineEquation: BaseInlineEquationPlugin,
  link: BaseLinkPlugin,
  mediaEmbed: BaseMediaEmbedPlugin,
  mention: BaseMentionPlugin,
  paragraph: BaseParagraphPlugin,
  table: BaseTablePlugin,
  tableCell: BaseTableCellPlugin,
  tableRow: BaseTableRowPlugin,
  tag: null,
  toc: BaseTocPlugin,
  toggle: null,
  video: BaseVideoPlugin,
};

const MEDIA_OWNERS = [
  'audio',
  'file',
  'image',
  'mediaEmbed',
  'video',
] as const satisfies readonly V53ElementOwner[];

export const resolveV54BuiltIns = (target: DocumentMigrationTarget) => {
  const typeOf = (plugin: Readonly<{ name: string }>) =>
    getMigrationBinding(target, plugin)?.elementType ?? undefined;
  const propertyIdsOf = (plugin: Readonly<{ name: string }>) =>
    new Set(getMigrationBinding(target, plugin)?.propertyIds);
  const elementType = (owner: V53ElementOwner) => {
    const plugin = V53_OWNER_PLUGINS[owner];

    return plugin ? typeOf(plugin) : undefined;
  };
  const elementTypes = (owners: readonly V53ElementOwner[]) =>
    new Set(
      owners
        .map(elementType)
        .filter((type): type is string => type !== undefined)
    );

  return {
    declared: {
      indent: propertyIdsOf(BaseIndentPlugin),
      lineHeight: propertyIdsOf(BaseLineHeightPlugin),
      list: propertyIdsOf(BaseListPlugin),
      textAlign: propertyIdsOf(BaseTextAlignPlugin),
    },
    detailsSummaryType: typeOf(BaseDetailsSummaryPlugin),
    detailsType: typeOf(BaseDetailsPlugin),
    elementType,
    equationTypes: elementTypes(['equation', 'inlineEquation']),
    mediaTypes: elementTypes(MEDIA_OWNERS),
    scriptKey:
      getMigrationBinding(target, BaseScriptPlugin)?.propertyKey ?? undefined,
  };
};
