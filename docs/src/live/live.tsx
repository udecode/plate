import React, { useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { Highlight } from '@styled-icons/boxicons-regular/Highlight';
import { Subscript } from '@styled-icons/foundation/Subscript';
import { Superscript } from '@styled-icons/foundation/Superscript';
import { BorderAll } from '@styled-icons/material/BorderAll';
import { BorderBottom } from '@styled-icons/material/BorderBottom';
import { BorderClear } from '@styled-icons/material/BorderClear';
import { BorderLeft } from '@styled-icons/material/BorderLeft';
import { BorderRight } from '@styled-icons/material/BorderRight';
import { BorderTop } from '@styled-icons/material/BorderTop';
import { FontDownload } from '@styled-icons/material/FontDownload';
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import { FormatBold } from '@styled-icons/material/FormatBold';
import { FormatColorText } from '@styled-icons/material/FormatColorText';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import { FormatQuote } from '@styled-icons/material/FormatQuote';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
import { Image } from '@styled-icons/material/Image';
import { Keyboard } from '@styled-icons/material/Keyboard';
import { Link } from '@styled-icons/material/Link';
import { Looks3 } from '@styled-icons/material/Looks3';
import { Looks4 } from '@styled-icons/material/Looks4';
import { Looks5 } from '@styled-icons/material/Looks5';
import { Looks6 } from '@styled-icons/material/Looks6';
import { LooksOne } from '@styled-icons/material/LooksOne';
import { LooksTwo } from '@styled-icons/material/LooksTwo';
import { Search } from '@styled-icons/material/Search';
import {
  addColumn,
  addRow,
  BalloonToolbar,
  CodeBlockElement,
  createAlignPlugin,
  createAutoformatPlugin,
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createDeserializeAstPlugin,
  createDeserializeCSVPlugin,
  createDeserializeHTMLPlugin,
  createDeserializeMDPlugin,
  createEditorPlugins,
  createExitBreakPlugin,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createParagraphPlugin,
  createPlateComponents,
  createPlateOptions,
  createReactPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createSingleLinePlugin,
  createSoftBreakPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  deleteColumn,
  deleteRow,
  deleteTable,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_DEFAULT,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  getNodeDeserializer,
  getParent,
  getPlatePluginOptions,
  getPlatePluginType,
  getRenderLeaf,
  HeadingToolbar,
  insertEmptyCodeBlock,
  insertTable,
  isBlockAboveEmpty,
  isElement,
  isSelectionAtBlockStart,
  isType,
  KEYS_HEADING,
  MARK_BG_COLOR,
  MARK_BOLD,
  MARK_CODE,
  MARK_COLOR,
  MARK_FONT_SIZE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MentionElement,
  MentionSelect,
  Plate,
  serializeHTMLFromNodes,
  StyledLeaf,
  toggleList,
  ToolbarAlign,
  ToolbarButton,
  ToolbarCodeBlock,
  ToolbarColorPicker,
  ToolbarElement,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarMark,
  ToolbarSearchHighlight,
  ToolbarTable,
  unwrapList,
  useEventEditorId,
  useFindReplacePlugin,
  useMentionPlugin,
  usePlate,
  usePlateActions,
  usePopupPosition,
  useStoreEditorEnabled,
  useStoreEditorRef,
  useStoreEditorSelection,
  useStoreEditorState,
  withProps,
  withStyledProps,
} from '@udecode/plate';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-excalidraw';
import { createEditor, Editor, Transforms } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { css } from 'styled-components';
import {
  getHugeDocument,
  initialValueAutoformat,
  initialValueBalloonToolbar,
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValueCombobox,
  initialValueEmbeds,
  initialValueExcalidraw,
  initialValueExitBreak,
  initialValueFont,
  initialValueForcedLayout,
  initialValueHighlight,
  initialValueIframe,
  initialValueImages,
  initialValueKbd,
  initialValueLinks,
  initialValueList,
  initialValueMarks,
  initialValueMentions,
  initialValuePasteAst,
  initialValuePasteCSV,
  initialValuePasteHtml,
  initialValuePasteMd,
  initialValuePlaceholder,
  initialValuePlainText,
  initialValuePlayground,
  initialValuePreview,
  initialValueSearchHighlighting,
  initialValueSingleLine,
  initialValueSoftBreak,
  initialValueTables,
  initialValueVoids,
} from './config/initialValues';
import { MENTIONABLES } from './config/mentionables';
import {
  optionsAutoformat,
  optionsExitBreakPlugin,
  optionsMentionPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from './config/pluginOptions';
import { renderMentionLabel } from './config/renderMentionLabel';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
  ToolbarHighlight,
  ToolbarKbd,
} from './config/Toolbars';
import { withStyledDraggables } from './config/withStyledDraggables';
import { withStyledPlaceHolders } from './config/withStyledPlaceHolders';
import { useComboboxControls } from './examples/combobox/hooks/useComboboxControls';
import { useComboboxOnChange } from './examples/combobox/hooks/useComboboxOnChange';
import { useComboboxOnKeyDown } from './examples/combobox/hooks/useComboboxOnKeyDown';
import { useComboboxIsOpen } from './examples/combobox/selectors/useComboboxIsOpen';
import { useComboboxStore } from './examples/combobox/useComboboxStore';
import { createEditableVoidPlugin } from './examples/editable-voids/createEditableVoidPlugin';
import { EDITABLE_VOID } from './examples/editable-voids/defaults';
import { EditableVoidElement } from './examples/editable-voids/EditableVoidElement';
import { IFrame } from './examples/iframe/IFrame';
import { createPreviewPlugin } from './examples/preview-markdown/createPreviewPlugin';
import { TagCombobox } from './examples/tag/components/TagCombobox';
import { TagElement } from './examples/tag/components/TagElement';
import { createTagPlugin } from './examples/tag/createTagPlugin';
import { ELEMENT_TAG } from './examples/tag/defaults';
import { useTagOnChange } from './examples/tag/hooks/useTagOnChange';
import { useTagOnSelectItem } from './examples/tag/hooks/useTagOnSelectItem';
import { HighlightHTML } from './utils/HighlightHTML';

const editableProps = {
  placeholder: 'Type…',
  style: {
    padding: '15px',
  },
};

const components = createPlateComponents({
  [ELEMENT_CODE_BLOCK]: withProps(CodeBlockElement, {
    styles: {
      root: [
        css`
          background-color: #111827;
          code {
            color: white;
          }
        `,
      ],
    },
  }),
});

const options = createPlateOptions();

const pluginsCore = [createReactPlugin(), createHistoryPlugin()];

const pluginsBasicElements = [
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements
];

const pluginsBasicMarks = [
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
];

const pluginsBasic = [
  ...pluginsCore,
  ...pluginsBasicElements,
  ...pluginsBasicMarks,
];

const pluginsImage = [
  ...pluginsCore,
  ...createBasicElementPlugins(),
  ...pluginsBasicMarks,
  createImagePlugin(),
  createSelectOnBackspacePlugin({ allow: [ELEMENT_IMAGE] }),
];

const initialValueBasic = [
  ...initialValueBasicElements,
  ...initialValueBasicMarks,
];

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  isType,
  insertEmptyCodeBlock,
  ELEMENT_DEFAULT,
  toggleList,
  getParent,
  isElement,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  ExcalidrawElement,
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  KEYS_HEADING,
  deleteTable,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
  insertTable,
  ToolbarAlign,
  ToolbarElement,
  ToolbarList,
  ToolbarTable,
  ToolbarCodeBlock,
  CodeAlt,
  CodeBlock,
  Highlight,
  Subscript,
  Superscript,
  BorderAll,
  BorderBottom,
  BorderClear,
  BorderLeft,
  BorderRight,
  BorderTop,
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  Keyboard,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  initialValuePlayground,
  optionsMentionPlugin,
  usePlateActions,
  useStoreEditorEnabled,
  renderMentionLabel,
  useComboboxOnChange,
  CodeBlockElement,
  Slate,
  Editable,
  createPlateOptions,
  IFrame,
  useCallback,
  initialValueCombobox,
  useComboboxControls,
  useComboboxOnKeyDown,
  useComboboxIsOpen,
  useComboboxStore,
  TagCombobox,
  TagElement,
  createTagPlugin,
  ELEMENT_TAG,
  useTagOnChange,
  useTagOnSelectItem,
  ReactEditor,
  EDITABLE_VOID,
  EditableVoidElement,
  initialValueIframe,
  usePlate,
  useStoreEditorRef,
  HighlightHTML,
  BallonToolbarMarks,
  initialValuePasteMd,
  initialValuePasteAst,
  initialValuePasteCSV,
  createDeserializeMDPlugin,
  createDeserializeCSVPlugin,
  createPreviewPlugin,
  initialValuePreview,
  components,
  corePlugins: pluginsCore,
  createAlignPlugin,
  createAutoformatPlugin,
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createDeserializeHTMLPlugin,
  createDeserializeAstPlugin,
  createEditableVoidPlugin,
  createEditor,
  unwrapList,
  createEditorPlugins,
  createExcalidrawPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createPlateComponents,
  createSoftBreakPlugin,
  createSingleLinePlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  DndProvider,
  editableProps,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  initialValueExcalidraw,
  ELEMENT_EXCALIDRAW,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  initialValueBalloonToolbar,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  HeadingToolbar,
  HTML5Backend,
  Image,
  BalloonToolbar,
  ToolbarMark,
  getPlatePluginType,
  initialValueAutoformat,
  initialValueBasic,
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValueEmbeds,
  initialValueExitBreak,
  initialValueForcedLayout,
  initialValueHighlight,
  initialValueImages,
  initialValueKbd,
  initialValueLinks,
  initialValueList,
  initialValueMarks,
  initialValueMentions,
  initialValuePasteHtml,
  initialValuePlaceholder,
  initialValuePlainText,
  initialValueSearchHighlighting,
  initialValueSoftBreak,
  initialValueSingleLine,
  initialValueTables,
  initialValueVoids,
  useEventEditorId,
  Link,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MENTIONABLES,
  MentionElement,
  MentionSelect,
  options,
  optionsAutoformat,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
  pluginsBasic,
  pluginsBasicElements,
  pluginsBasicMarks,
  pluginsCore,
  createFontSizePlugin,
  pluginsImage,
  Search,
  serializeHTMLFromNodes,
  Plate,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
  ToolbarImage,
  ToolbarHighlight,
  ToolbarLink,
  ToolbarKbd,
  ToolbarSearchHighlight,
  useFindReplacePlugin,
  useMentionPlugin,
  withProps,
  withStyledDraggables,
  withStyledPlaceHolders,
  getHugeDocument,
  withReact,
  MARK_COLOR,
  MARK_BG_COLOR,
  MARK_FONT_SIZE,
  withStyledProps,
  StyledLeaf,
  getRenderLeaf,
  FormatColorText,
  FontDownload,
  useStoreEditorState,
  useStoreEditorSelection,
  Editor,
  ToolbarButton,
  Transforms,
  getPlatePluginOptions,
  getNodeDeserializer,
  createFontColorPlugin,
  createFontBackgroundColorPlugin,
  initialValueFont,
  ToolbarColorPicker,
  usePopupPosition,
};

export default ReactLiveScope;
