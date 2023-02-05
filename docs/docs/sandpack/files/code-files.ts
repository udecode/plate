import { files } from './code-files';
import { alignFiles } from './align/code-alignFiles';
import { autoformatFiles } from './autoformat/code-autoformatFiles';
import { balloonToolbarFiles } from './balloon-toolbar/code-balloonToolbarFiles';
import { basicEditorFiles } from './basic-editor/code-basicEditorFiles';
import { basicElementsFiles } from './basic-elements/code-basicElementsFiles';
import { basicMarksFiles } from './basic-marks/code-basicMarksFiles';
import { basicNodesFiles } from './basic-nodes/code-basicNodesFiles';
import { basicPluginsFiles } from './basic-plugins/code-basicPluginsFiles';
import { cloudFiles } from './cloud/code-cloudFiles';
import { commentsFiles } from './comments/code-commentsFiles';
import { commonFiles } from './common/code-commonFiles';
import { cursorOverlayFiles } from './cursor-overlay/code-cursorOverlayFiles';
import { dndFiles } from './dnd/code-dndFiles';
import { editableVoidsFiles } from './editable-voids/code-editableVoidsFiles';
import { emojiFiles } from './emoji/code-emojiFiles';
import { excalidrawFiles } from './excalidraw/code-excalidrawFiles';
import { exitBreakFiles } from './exit-break/code-exitBreakFiles';
import { findReplaceFiles } from './find-replace/code-findReplaceFiles';
import { fontFiles } from './font/code-fontFiles';
import { forcedLayoutFiles } from './forced-layout/code-forcedLayoutFiles';
import { highlightFiles } from './highlight/code-highlightFiles';
import { horizontalRuleFiles } from './horizontal-rule/code-horizontalRuleFiles';
import { hugeDocumentFiles } from './huge-document/code-hugeDocumentFiles';
import { iframeFiles } from './iframe/code-iframeFiles';
import { indentFiles } from './indent/code-indentFiles';
import { indentListFiles } from './indent-list/code-indentListFiles';
import { kbdFiles } from './kbd/code-kbdFiles';
import { lineHeightFiles } from './line-height/code-lineHeightFiles';
import { linkFiles } from './link/code-linkFiles';
import { listFiles } from './list/code-listFiles';
import { mediaFiles } from './media/code-mediaFiles';
import { mentionFiles } from './mention/code-mentionFiles';
import { multipleEditorsFiles } from './multiple-editors/code-multipleEditorsFiles';
import { placeholderFiles } from './placeholder/code-placeholderFiles';
import { previewMarkdownFiles } from './preview-markdown/code-previewMarkdownFiles';
import { resetNodeFiles } from './reset-node/code-resetNodeFiles';
import { selectOnBackspaceFiles } from './select-on-backspace/code-selectOnBackspaceFiles';
import { serializingCsvFiles } from './serializing-csv/code-serializingCsvFiles';
import { serializingDocxFiles } from './serializing-docx/code-serializingDocxFiles';
import { serializingHtmlFiles } from './serializing-html/code-serializingHtmlFiles';
import { serializingMdFiles } from './serializing-md/code-serializingMdFiles';
import { singleLineFiles } from './single-line/code-singleLineFiles';
import { softBreakFiles } from './soft-break/code-softBreakFiles';
import { tabbableFiles } from './tabbable/code-tabbableFiles';
import { tableFiles } from './table/code-tableFiles';
import { toolbarFiles } from './toolbar/code-toolbarFiles';
import { trailingBlockFiles } from './trailing-block/code-trailingBlockFiles';
import { typescriptFiles } from './typescript/code-typescriptFiles';

export const rootFiles = {
  ...files,
  ...alignFiles,
  ...autoformatFiles,
  ...balloonToolbarFiles,
  ...basicEditorFiles,
  ...basicElementsFiles,
  ...basicMarksFiles,
  ...basicNodesFiles,
  ...basicPluginsFiles,
  ...cloudFiles,
  ...commentsFiles,
  ...commonFiles,
  ...cursorOverlayFiles,
  ...dndFiles,
  ...editableVoidsFiles,
  ...emojiFiles,
  ...excalidrawFiles,
  ...exitBreakFiles,
  ...findReplaceFiles,
  ...fontFiles,
  ...forcedLayoutFiles,
  ...highlightFiles,
  ...horizontalRuleFiles,
  ...hugeDocumentFiles,
  ...iframeFiles,
  ...indentFiles,
  ...indentListFiles,
  ...kbdFiles,
  ...lineHeightFiles,
  ...linkFiles,
  ...listFiles,
  ...mediaFiles,
  ...mentionFiles,
  ...multipleEditorsFiles,
  ...placeholderFiles,
  ...previewMarkdownFiles,
  ...resetNodeFiles,
  ...selectOnBackspaceFiles,
  ...serializingCsvFiles,
  ...serializingDocxFiles,
  ...serializingHtmlFiles,
  ...serializingMdFiles,
  ...singleLineFiles,
  ...softBreakFiles,
  ...tabbableFiles,
  ...tableFiles,
  ...toolbarFiles,
  ...trailingBlockFiles,
  ...typescriptFiles,
};
