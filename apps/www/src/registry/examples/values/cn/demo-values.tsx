import { aiValue } from './ai-value';
import { alignValue } from './align-value';
import { autoformatValue } from './autoformat-value';
import { basicBlocksValue } from './basic-blocks-value';
import { basicMarksValue } from './basic-marks-value';
import { basicNodesValue } from './basic-nodes-value';
import { blockMenuValue } from './block-menu-value';
import { nodeSelectionValue } from './node-selection-value';
import { columnValue } from './column-value';
import { copilotValue } from './copilot-value';
import { dateValue } from './date-value';
import { deserializeCsvValue } from './deserialize-csv-value';
import { deserializeDocxValue } from './deserialize-docx-value';
import { deserializeHtmlValue } from './deserialize-html-value';
import { deserializeMdValue } from './deserialize-md-value';
import { discussionValue } from './discussion-value';
import { dndValue } from './dnd-value';
import { editableVoidsValue } from './editable-voids-value';
import { emojiValue } from './emoji-value';
import { excalidrawValue } from './excalidraw-value';
import { exitBreakValue } from './exit-break-value';
import { findValue } from './find-value';
import { floatingToolbarValue } from './floating-toolbar-value';
import { fontValue } from './font-value';
import { iframeValue } from './iframe-value';
import { indentValue } from './indent-value';
import { lineHeightValue } from './line-height-value';
import { linkValue } from './link-value';
import { listValue } from './list-value';
import { mediaValue } from './media-value';
import { mentionValue } from './mention-value';
import { placeholderValue } from './placeholder-value';
import { previewMdValue } from './preview-md-value';
import { slashCommandValue } from './slash-command-value';
import { tabbableValue } from './tabbable-value';
import { tableValue } from './table-value';
import { tocValue } from './toc-value';
import { detailsValue } from './details-value';

const values = {
  ai: aiValue,
  autoformat: autoformatValue,
  'basic-blocks': basicBlocksValue,
  'basic-marks': basicMarksValue,
  'basic-nodes': basicNodesValue,
  'block-menu': blockMenuValue,
  'node-selection': nodeSelectionValue,
  // callout: calloutValue,
  column: columnValue,
  copilot: copilotValue,
  csv: deserializeCsvValue,
  date: dateValue,
  discussion: discussionValue,
  dnd: dndValue,
  docx: deserializeDocxValue,
  'editable-voids': editableVoidsValue,
  emoji: emojiValue,
  // equation: equationValue,
  excalidraw: excalidrawValue,
  'exit-break': exitBreakValue,
  find: findValue,
  'floating-toolbar': floatingToolbarValue,
  font: fontValue,
  html: deserializeHtmlValue,
  // 'huge-document': hugeDocumentValue,
  iframe: iframeValue,
  indent: indentValue,
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
  'slash-command': slashCommandValue,
  tabbable: tabbableValue,
  table: tableValue,
  'text-align': alignValue,
  toc: tocValue,
  details: detailsValue,
  // upload: uploadValue,
};

export const DEMO_VALUES = values;
