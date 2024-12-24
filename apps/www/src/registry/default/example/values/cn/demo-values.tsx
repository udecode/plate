import { aiValue } from './ai-value';
import { alignValue } from './align-value';
import { autoformatValue } from './autoformat-value';
import { basicElementsValue } from './basic-elements-value';
import { basicMarksValue } from './basic-marks-value';
import { basicNodesValue } from './basic-nodes-value';
import { blockMenuValue } from './block-menu-value';
import { blockSelectionValue } from './block-selection-value';
import { columnValue } from './column-value';
import { commentsValue } from './comments-value';
import { copilotValue } from './copilot-value';
import { cursorOverlayValue } from './cursor-overlay-value';
import { dateValue } from './date-value';
import { deserializeCsvValue } from './deserialize-csv-value';
import { deserializeDocxValue } from './deserialize-docx-value';
import { deserializeHtmlValue } from './deserialize-html-value';
import { deserializeMdValue } from './deserialize-md-value';
import { dndValue } from './dnd-value';
import { editableVoidsValue } from './editable-voids-value';
import { emojiValue } from './emoji-value';
import { excalidrawValue } from './excalidraw-value';
import { exitBreakValue } from './exit-break-value';
import { findReplaceValue } from './find-replace-value';
import { floatingToolbarValue } from './floating-toolbar-value';
import { fontValue } from './font-value';
import { highlightValue } from './highlight-value';
import { horizontalRuleValue } from './horizontal-rule-value';
import { iframeValue } from './iframe-value';
import { indentListValue } from './indent-list-value';
import { indentValue } from './indent-value';
import { kbdValue } from './kbd-value';
import { lineHeightValue } from './line-height-value';
import { linkValue } from './link-value';
import { listValue } from './list-value';
import { mediaValue } from './media-value';
import { mentionValue } from './mention-value';
import { placeholderValue } from './placeholder-value';
import { previewMdValue } from './preview-md-value';
import { singleLineValue } from './single-line-value';
import { slashCommandValue } from './slash-command-value';
import { softBreakValue } from './soft-break-value';
import { suggestionValue } from './suggestion-value';
import { tabbableValue } from './tabbable-value';
import { tableValue } from './table-value';
import { tocValue } from './toc-value';
import { toggleValue } from './toggle-value';

const values = {
  ai: aiValue,
  align: alignValue,
  autoformat: autoformatValue,
  'basic-elements': basicElementsValue,
  'basic-marks': basicMarksValue,
  'basic-nodes': basicNodesValue,
  'block-menu': blockMenuValue,
  'block-selection': blockSelectionValue,
  // callout: calloutValue,
  column: columnValue,
  comments: commentsValue,
  copilot: copilotValue,
  csv: deserializeCsvValue,
  'cursor-overlay': cursorOverlayValue,
  date: dateValue,
  dnd: dndValue,
  docx: deserializeDocxValue,
  'editable-voids': editableVoidsValue,
  emoji: emojiValue,
  // equation: equationValue,
  excalidraw: excalidrawValue,
  'exit-break': exitBreakValue,
  'find-replace': findReplaceValue,
  'floating-toolbar': floatingToolbarValue,
  font: fontValue,
  highlight: highlightValue,
  'horizontal-rule': horizontalRuleValue,
  html: deserializeHtmlValue,
  // 'huge-document': hugeDocumentValue,
  iframe: iframeValue,
  indent: indentValue,
  'indent-list': indentListValue,
  kbd: kbdValue,
  'line-height': lineHeightValue,
  link: linkValue,
  list: listValue,
  markdown: deserializeMdValue,
  media: mediaValue,
  // 'media-toolbar': mediaToolbarValue,
  mention: mentionValue,
  // 'multi-editors': multiEditorsValue,
  placeholder: placeholderValue,
  'preview-markdown': previewMdValue,
  'reset-node': basicElementsValue,
  'single-line': singleLineValue,
  'slash-command': slashCommandValue,
  'soft-break': softBreakValue,
  suggestion: suggestionValue,
  tabbable: tabbableValue,
  table: tableValue,
  toc: tocValue,
  toggle: toggleValue,
  // upload: uploadValue,
};

export const DEMO_VALUES = Object.entries(values).reduce(
  (acc, [key, value]) => {
    const demoKey = key.replace('Value', '');
    acc[demoKey] = value;

    return acc;
  },
  {} as Record<string, any>
);
