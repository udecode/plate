'use client';

import * as React from 'react';

import type { SinkIconName, SinkSurface } from '@/components/sink/sink-types';

import { IconPlaceholder } from './icon-placeholder';

type PlaceholderIconProps = Pick<
  React.ComponentProps<typeof IconPlaceholder>,
  'hugeicons' | 'lucide' | 'phosphor' | 'remixicon' | 'tabler'
>;

const CREATE_SINK_ICONS: Record<SinkIconName, PlaceholderIconProps> = {
  baseline: {
    hugeicons: 'TextColorIcon',
    lucide: 'BaselineIcon',
    phosphor: 'TextAUnderlineIcon',
    remixicon: 'RiFontColor',
    tabler: 'IconBaseline',
  },
  bold: {
    hugeicons: 'TextBoldIcon',
    lucide: 'BoldIcon',
    phosphor: 'TextBIcon',
    remixicon: 'RiBold',
    tabler: 'IconBold',
  },
  check: {
    hugeicons: 'Tick02Icon',
    lucide: 'Check',
    phosphor: 'CheckIcon',
    remixicon: 'RiCheckLine',
    tabler: 'IconCheck',
  },
  chevronRight: {
    hugeicons: 'ArrowRight01Icon',
    lucide: 'ChevronRightIcon',
    phosphor: 'CaretRightIcon',
    remixicon: 'RiArrowRightSLine',
    tabler: 'IconChevronRight',
  },
  code: {
    hugeicons: 'SourceCodeIcon',
    lucide: 'Code2Icon',
    phosphor: 'CodeIcon',
    remixicon: 'RiCodeSSlashLine',
    tabler: 'IconCode',
  },
  copy: {
    hugeicons: 'Copy01Icon',
    lucide: 'CopyIcon',
    phosphor: 'CopyIcon',
    remixicon: 'RiFileCopyLine',
    tabler: 'IconCopy',
  },
  heading1: {
    hugeicons: 'Heading01Icon',
    lucide: 'Heading1Icon',
    phosphor: 'TextHOneIcon',
    remixicon: 'RiH1',
    tabler: 'IconH1',
  },
  highlighter: {
    hugeicons: 'HighlighterIcon',
    lucide: 'HighlighterIcon',
    phosphor: 'HighlighterIcon',
    remixicon: 'RiMarkPenLine',
    tabler: 'IconHighlight',
  },
  italic: {
    hugeicons: 'TextItalicIcon',
    lucide: 'ItalicIcon',
    phosphor: 'TextItalicIcon',
    remixicon: 'RiItalic',
    tabler: 'IconItalic',
  },
  lightbulb: {
    hugeicons: 'BulbIcon',
    lucide: 'LightbulbIcon',
    phosphor: 'LightbulbIcon',
    remixicon: 'RiLightbulbLine',
    tabler: 'IconBulb',
  },
  list: {
    hugeicons: 'Menu01Icon',
    lucide: 'ListIcon',
    phosphor: 'ListIcon',
    remixicon: 'RiListUnordered',
    tabler: 'IconListDetails',
  },
  listPlus: {
    hugeicons: 'PlayListAddIcon',
    lucide: 'ListPlus',
    phosphor: 'ListPlusIcon',
    remixicon: 'RiMenuAddLine',
    tabler: 'IconPlaylistAdd',
  },
  paintBucket: {
    hugeicons: 'PaintBucketIcon',
    lucide: 'PaintBucketIcon',
    phosphor: 'PaintBucketIcon',
    remixicon: 'RiPaintLine',
    tabler: 'IconBucketDroplet',
  },
  penLine: {
    hugeicons: 'PencilEdit02Icon',
    lucide: 'PenLine',
    phosphor: 'PencilLineIcon',
    remixicon: 'RiEditLine',
    tabler: 'IconWriting',
  },
  pilcrow: {
    hugeicons: 'ParagraphIcon',
    lucide: 'PilcrowIcon',
    phosphor: 'ParagraphIcon',
    remixicon: 'RiParagraph',
    tabler: 'IconPilcrow',
  },
  quote: {
    hugeicons: 'QuoteDownIcon',
    lucide: 'Quote',
    phosphor: 'QuotesIcon',
    remixicon: 'RiDoubleQuotesL',
    tabler: 'IconQuote',
  },
  radical: {
    hugeicons: 'SquareRootSquareIcon',
    lucide: 'RadicalIcon',
    phosphor: 'RadicalIcon',
    remixicon: 'RiSquareRoot',
    tabler: 'IconSquareRoot',
  },
  sparkles: {
    hugeicons: 'SparklesIcon',
    lucide: 'SparklesIcon',
    phosphor: 'SparkleIcon',
    remixicon: 'RiSparklingLine',
    tabler: 'IconSparkles',
  },
  strikethrough: {
    hugeicons: 'TextStrikethroughIcon',
    lucide: 'StrikethroughIcon',
    phosphor: 'TextStrikethroughIcon',
    remixicon: 'RiStrikethrough',
    tabler: 'IconStrikethrough',
  },
  table: {
    hugeicons: 'TableIcon',
    lucide: 'TableIcon',
    phosphor: 'TableIcon',
    remixicon: 'RiTableLine',
    tabler: 'IconTable',
  },
  underline: {
    hugeicons: 'TextUnderlineIcon',
    lucide: 'UnderlineIcon',
    phosphor: 'TextUnderlineIcon',
    remixicon: 'RiUnderline',
    tabler: 'IconUnderline',
  },
  wand: {
    hugeicons: 'MagicWand01Icon',
    lucide: 'Wand',
    phosphor: 'MagicWandIcon',
    remixicon: 'RiMagicLine',
    tabler: 'IconWand',
  },
  wandSparkles: {
    hugeicons: 'MagicWand01Icon',
    lucide: 'WandSparklesIcon',
    phosphor: 'MagicWandIcon',
    remixicon: 'RiMagicLine',
    tabler: 'IconWand',
  },
  x: {
    hugeicons: 'Cancel01Icon',
    lucide: 'X',
    phosphor: 'XIcon',
    remixicon: 'RiCloseLine',
    tabler: 'IconX',
  },
};

export function CreateSinkIcon({
  className,
  name,
}: {
  className?: string;
  name: SinkIconName;
}) {
  return <IconPlaceholder {...CREATE_SINK_ICONS[name]} className={className} />;
}

export const CREATE_SINK_SURFACE: SinkSurface = {
  badge: 'cn-badge',
  badgeDefault: 'cn-badge-variant-default',
  badgeOutline: 'cn-badge-variant-outline',
  badgeSecondary: 'cn-badge-variant-secondary',
  card: 'cn-card',
  menuContent: 'cn-dropdown-menu-content cn-menu-target',
  menuItem: 'cn-dropdown-menu-item',
  menuLabel: 'cn-dropdown-menu-label',
  menuSeparator: 'cn-dropdown-menu-separator',
  menuShortcut: 'cn-dropdown-menu-shortcut',
  menuSubContent: 'cn-dropdown-menu-sub-content cn-menu-target',
  menuSubTrigger: 'cn-dropdown-menu-sub-trigger',
  popover: 'cn-popover-content cn-menu-target',
};
