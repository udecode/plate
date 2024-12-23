import { getI18nContent } from '@/utils/getI18nConent';

import { aiValue as aiValueZh } from './cn/ai-value';
import { alignValue as alignValueZh } from './cn/align-value';
import { autoformatValue as autoformatValueZh } from './cn/autoformat-value';
import { basicElementsValue as basicElementsValueZh } from './cn/basic-elements-value';
import { basicMarksValue as basicMarksValueZh } from './cn/basic-marks-value';
import { basicNodesValue as basicNodesValueZh } from './cn/basic-nodes-value';
import { blockMenuValue as blockMenuValueZh } from './cn/block-menu-value';
import { blockSelectionValue as blockSelectionValueZh } from './cn/block-selection-value';
import { columnValue as columnValueZh } from './cn/column-value';
import { commentsValue as commentsValueZh } from './cn/comments-value';
import { copilotValue as copilotValueZh } from './cn/copilot-value';
import { cursorOverlayValue as cursorOverlayValueZh } from './cn/cursor-overlay-value';
import { dateValue as dateValueZh } from './cn/date-value';
import { deserializeCsvValue as deserializeCsvValueZh } from './cn/deserialize-csv-value';
import { deserializeDocxValue as deserializeDocxValueZh } from './cn/deserialize-docx-value';
import { deserializeHtmlValue as deserializeHtmlValueZh } from './cn/deserialize-html-value';
import { deserializeMdValue as deserializeMdValueZh } from './cn/deserialize-md-value';
import { dndValue as dndValueZh } from './cn/dnd-value';
import { editableVoidsValue as editableVoidsValueZh } from './cn/editable-voids-value';
import { emojiValue as emojiValueZh } from './cn/emoji-value';
import { excalidrawValue as excalidrawValueZh } from './cn/excalidraw-value';
import {
  exitBreakValue as exitBreakValueZh,
  trailingBlockValue as trailingBlockValueZh,
} from './cn/exit-break-value';
import { findReplaceValue as findReplaceValueZh } from './cn/find-replace-value';
import { floatingToolbarValue as floatingToolbarValueZh } from './cn/floating-toolbar-value';
import { fontValue as fontValueZh } from './cn/font-value';
import { highlightValue as highlightValueZh } from './cn/highlight-value';
import { horizontalRuleValue as horizontalRuleValueZh } from './cn/horizontal-rule-value';
import { iframeValue as iframeValueZh } from './cn/iframe-value';
import { indentListValue as indentListValueZh } from './cn/indent-list-value';
import { indentValue as indentValueZh } from './cn/indent-value';
import { kbdValue as kbdValueZh } from './cn/kbd-value';
import { lineHeightValue as lineHeightValueZh } from './cn/line-height-value';
import { linkValue as linkValueZh } from './cn/link-value';
import {
  listValue as listValueZh,
  todoListValue as todoListValueZh,
} from './cn/list-value';
import { mediaValue as mediaValueZh } from './cn/media-value';
import { mentionValue as mentionValueZh } from './cn/mention-value';
import { placeholderValue as placeholderValueZh } from './cn/placeholder-value';
import { previewMdValue as previewMdValueZh } from './cn/preview-md-value';
import { singleLineValue as singleLineValueZh } from './cn/single-line-value';
import { slashCommandValue as slashCommandValueZh } from './cn/slash-command-value';
import { softBreakValue as softBreakValueZh } from './cn/soft-break-value';
import { suggestionValue as suggestionValueZh } from './cn/suggestion-value';
import { tabbableValue as tabbableValueZh } from './cn/tabbable-value';
import { tableValue as tableValueZh } from './cn/table-value';
import { tocValue as tocValueZh } from './cn/toc-value';
import { toggleValue as toggleValueZh } from './cn/toggle-value';
import { aiValue as aiValueEn } from './en/ai-value';
import { alignValue as alignValueEn } from './en/align-value';
import { autoformatValue as autoformatValueEn } from './en/autoformat-value';
import { basicElementsValue as basicElementsValueEn } from './en/basic-elements-value';
import { basicMarksValue as basicMarksValueEn } from './en/basic-marks-value';
import { basicNodesValue as basicNodesValueEn } from './en/basic-nodes-value';
import { blockMenuValue as blockMenuValueEn } from './en/block-menu-value';
import { blockSelectionValue as blockSelectionValueEn } from './en/block-selection-value';
import { columnValue as columnValueEn } from './en/column-value';
import { commentsValue as commentsValueEn } from './en/comments-value';
import { copilotValue as copilotValueEn } from './en/copilot-value';
import { cursorOverlayValue as cursorOverlayValueEn } from './en/cursor-overlay-value';
import { dateValue as dateValueEn } from './en/date-value';
import { deserializeCsvValue as deserializeCsvValueEn } from './en/deserialize-csv-value';
import { deserializeDocxValue as deserializeDocxValueEn } from './en/deserialize-docx-value';
import { deserializeHtmlValue as deserializeHtmlValueEn } from './en/deserialize-html-value';
import { deserializeMdValue as deserializeMdValueEn } from './en/deserialize-md-value';
import { dndValue as dndValueEn } from './en/dnd-value';
import { editableVoidsValue as editableVoidsValueEn } from './en/editable-voids-value';
import { emojiValue as emojiValueEn } from './en/emoji-value';
import { excalidrawValue as excalidrawValueEn } from './en/excalidraw-value';
import {
  exitBreakValue as exitBreakValueEn,
  trailingBlockValue as trailingBlockValueEn,
} from './en/exit-break-value';
import { findReplaceValue as findReplaceValueEn } from './en/find-replace-value';
import { floatingToolbarValue as floatingToolbarValueEn } from './en/floating-toolbar-value';
import { fontValue as fontValueEn } from './en/font-value';
import { highlightValue as highlightValueEn } from './en/highlight-value';
import { horizontalRuleValue as horizontalRuleValueEn } from './en/horizontal-rule-value';
import { iframeValue as iframeValueEn } from './en/iframe-value';
import { indentListValue as indentListValueEn } from './en/indent-list-value';
import { indentValue as indentValueEn } from './en/indent-value';
import { kbdValue as kbdValueEn } from './en/kbd-value';
import { lineHeightValue as lineHeightValueEn } from './en/line-height-value';
import { linkValue as linkValueEn } from './en/link-value';
import {
  listValue as listValueEn,
  todoListValue as todoListValueEn,
} from './en/list-value';
import { mediaValue as mediaValueEn } from './en/media-value';
import { mentionValue as mentionValueEn } from './en/mention-value';
import { placeholderValue as placeholderValueEn } from './en/placeholder-value';
import { previewMdValue as previewMdValueEn } from './en/preview-md-value';
import { singleLineValue as singleLineValueEn } from './en/single-line-value';
import { slashCommandValue as slashCommandValueEn } from './en/slash-command-value';
import { softBreakValue as softBreakValueEn } from './en/soft-break-value';
import { suggestionValue as suggestionValueEn } from './en/suggestion-value';
import { tabbableValue as tabbableValueEn } from './en/tabbable-value';
import { tableValue as tableValueEn } from './en/table-value';
import { tocValue as tocValueEn } from './en/toc-value';
import { toggleValue as toggleValueEn } from './en/toggle-value';

const i18n = {
  cn: {
    ai: aiValueZh,
    align: alignValueZh,
    autoformat: autoformatValueZh,
    basicElements: basicElementsValueZh,
    basicMarks: basicMarksValueZh,
    basicNodes: basicNodesValueZh,
    blockMenu: blockMenuValueZh,
    blockSelection: blockSelectionValueZh,
    column: columnValueZh,
    comments: commentsValueZh,
    copilot: copilotValueZh,
    cursorOverlay: cursorOverlayValueZh,
    date: dateValueZh,
    deserializeCsv: deserializeCsvValueZh,
    deserializeDocx: deserializeDocxValueZh,
    deserializeHtml: deserializeHtmlValueZh,
    deserializeMd: deserializeMdValueZh,
    dnd: dndValueZh,
    editableVoids: editableVoidsValueZh,
    emoji: emojiValueZh,
    excalidraw: excalidrawValueZh,
    exitBreak: exitBreakValueZh,
    findReplace: findReplaceValueZh,
    floatingToolbar: floatingToolbarValueZh,
    font: fontValueZh,
    highlight: highlightValueZh,
    horizontalRule: horizontalRuleValueZh,
    iframe: iframeValueZh,
    indent: indentValueZh,
    indentList: indentListValueZh,
    kbd: kbdValueZh,
    lineHeight: lineHeightValueZh,
    link: linkValueZh,
    list: listValueZh,
    media: mediaValueZh,
    mention: mentionValueZh,
    placeholder: placeholderValueZh,
    previewMd: previewMdValueZh,
    singleLine: singleLineValueZh,
    slashCommand: slashCommandValueZh,
    softBreak: softBreakValueZh,
    suggestion: suggestionValueZh,
    tabbable: tabbableValueZh,
    table: tableValueZh,
    toc: tocValueZh,
    todoList: todoListValueZh,
    toggle: toggleValueZh,
    trailingBlock: trailingBlockValueZh,
  },
  en: {
    ai: aiValueEn,
    align: alignValueEn,
    autoformat: autoformatValueEn,
    basicElements: basicElementsValueEn,
    basicMarks: basicMarksValueEn,
    basicNodes: basicNodesValueEn,
    blockMenu: blockMenuValueEn,
    blockSelection: blockSelectionValueEn,
    column: columnValueEn,
    comments: commentsValueEn,
    copilot: copilotValueEn,
    cursorOverlay: cursorOverlayValueEn,
    date: dateValueEn,
    deserializeCsv: deserializeCsvValueEn,
    deserializeDocx: deserializeDocxValueEn,
    deserializeHtml: deserializeHtmlValueEn,
    deserializeMd: deserializeMdValueEn,
    dnd: dndValueEn,
    editableVoids: editableVoidsValueEn,
    emoji: emojiValueEn,
    excalidraw: excalidrawValueEn,
    exitBreak: exitBreakValueEn,
    findReplace: findReplaceValueEn,
    floatingToolbar: floatingToolbarValueEn,
    font: fontValueEn,
    highlight: highlightValueEn,
    horizontalRule: horizontalRuleValueEn,
    iframe: iframeValueEn,
    indent: indentValueEn,
    indentList: indentListValueEn,
    kbd: kbdValueEn,
    lineHeight: lineHeightValueEn,
    link: linkValueEn,
    list: listValueEn,
    media: mediaValueEn,
    mention: mentionValueEn,
    placeholder: placeholderValueEn,
    previewMd: previewMdValueEn,
    singleLine: singleLineValueEn,
    slashCommand: slashCommandValueEn,
    softBreak: softBreakValueEn,
    suggestion: suggestionValueEn,
    tabbable: tabbableValueEn,
    table: tableValueEn,
    toc: tocValueEn,
    todoList: todoListValueEn,
    toggle: toggleValueEn,
    trailingBlock: trailingBlockValueEn,
  },
};

export const getI18nValues = () => getI18nContent(i18n);
