import { calloutValue } from '@/registry/examples/values/callout-value';
import { playgroundValue } from '@/registry/examples/values/playground-value';

import { aiValue } from './ai-value';
import { alignValue } from './align-value';
import { autoformatValue } from './autoformat-value';
import { basicBlocksValue } from './basic-blocks-value';
import { basicMarksValue } from './basic-marks-value';
import { basicNodesValue } from './basic-nodes-value';
import { blockMenuValue } from './block-menu-value';
import { blockSelectionValue } from './block-selection-value';
import { codeBlockValue } from './code-block-value';
import { columnValue } from './column-value';
import { copilotValue } from './copilot-value';
import { cursorOverlayValue } from './cursor-overlay-value';
import { dateValue } from './date-value';
import { deserializeCsvValue } from './deserialize-csv-value';
import { deserializeDocxValue } from './deserialize-docx-value';
import { deserializeHtmlValue } from './deserialize-html-value';
import { deserializeMdValue } from './deserialize-md-value';
import { discussionValue } from './discussion-value';
import { dndValue } from './dnd-value';
import { editableVoidsValue } from './editable-voids-value';
import { emojiValue } from './emoji-value';
import { equationValue } from './equation-value';
import { excalidrawValue } from './excalidraw-value';
import { exitBreakValue } from './exit-break-value';
import { findReplaceValue } from './find-replace-value';
import { floatingToolbarValue } from './floating-toolbar-value';
import { fontValue } from './font-value';
import { iframeValue } from './iframe-value';
import { indentValue } from './indent-value';
import { lineHeightValue } from './line-height-value';
import { linkValue } from './link-value';
import { listValue as listClassicValue } from './list-classic-value';
import { listValue } from './list-value';
import { mediaValue } from './media-value';
import { mentionValue } from './mention-value';
import { blockPlaceholderValue } from './placeholder-value';
import { pluginRulesValue } from './plugin-rules-value';
import { previewMdValue } from './preview-md-value';
import { slashCommandValue } from './slash-command-value';
import { tabbableValue } from './tabbable-value';
import { tableValue } from './table-value';
import { tocValue } from './toc-value';
import { toggleValue } from './toggle-value';

const values = {
  ai: aiValue,
  autoformat: autoformatValue,
  'basic-blocks': basicBlocksValue,
  'basic-marks': basicMarksValue,
  'basic-nodes': basicNodesValue,
  'block-menu': blockMenuValue,
  // 'multi-editors': multiEditorsValue,
  'block-placeholder': blockPlaceholderValue,
  'block-selection': blockSelectionValue,
  callout: calloutValue,
  'code-block': codeBlockValue,
  column: columnValue,
  copilot: copilotValue,
  csv: deserializeCsvValue,
  'cursor-overlay': cursorOverlayValue,
  date: dateValue,
  discussion: discussionValue,
  dnd: dndValue,
  docx: deserializeDocxValue,
  'editable-voids': editableVoidsValue,
  emoji: emojiValue,
  // upload: uploadValue,
  equation: equationValue,
  // equation: equationValue,
  excalidraw: excalidrawValue,
  'exit-break': exitBreakValue,
  'find-replace': findReplaceValue,
  'floating-toolbar': floatingToolbarValue,
  font: fontValue,
  html: deserializeHtmlValue,
  // 'huge-document': hugeDocumentValue,
  iframe: iframeValue,
  indent: indentValue,
  'line-height': lineHeightValue,
  link: linkValue,
  list: listValue,
  'list-classic': listClassicValue,
  markdown: deserializeMdValue,
  media: mediaValue,
  // 'media-toolbar': mediaToolbarValue,
  mention: mentionValue,
  playground: playgroundValue,
  'plugin-rules': pluginRulesValue,
  'preview-markdown': previewMdValue,
  'slash-command': slashCommandValue,
  tabbable: tabbableValue,
  table: tableValue,
  'text-align': alignValue,
  toc: tocValue,
  toggle: toggleValue,
};

export const DEMO_VALUES = Object.entries(values).reduce(
  (acc, [key, value]) => {
    const demoKey = key.replace('Value', '');
    acc[demoKey] = value;

    return acc;
  },
  {} as Record<string, any>
);
