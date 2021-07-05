import React, { useCallback } from 'react';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
// import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
// import { Highlight } from '@styled-icons/boxicons-regular/Highlight';
// import { Subscript } from '@styled-icons/foundation/Subscript';
// import { Superscript } from '@styled-icons/foundation/Superscript';
// import { BorderAll } from '@styled-icons/material/BorderAll';
// import { BorderBottom } from '@styled-icons/material/BorderBottom';
// import { BorderClear } from '@styled-icons/material/BorderClear';
// import { BorderLeft } from '@styled-icons/material/BorderLeft';
// import { BorderRight } from '@styled-icons/material/BorderRight';
// import { BorderTop } from '@styled-icons/material/BorderTop';
// import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
// import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
// import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
// import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
// import { FormatBold } from '@styled-icons/material/FormatBold';
// import { FormatItalic } from '@styled-icons/material/FormatItalic';
// import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
// import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
// import { FormatQuote } from '@styled-icons/material/FormatQuote';
// import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
// import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
// import { Image } from '@styled-icons/material/Image';
// import { Keyboard } from '@styled-icons/material/Keyboard';
// import { Link } from '@styled-icons/material/Link';
// import { Looks3 } from '@styled-icons/material/Looks3';
// import { Looks4 } from '@styled-icons/material/Looks4';
// import { Looks5 } from '@styled-icons/material/Looks5';
// import { Looks6 } from '@styled-icons/material/Looks6';
// import { LooksOne } from '@styled-icons/material/LooksOne';
// import { LooksTwo } from '@styled-icons/material/LooksTwo';
// import { Search } from '@styled-icons/material/Search';
// import { createAlignPlugin } from '@udecode/slate-plugins-alignment';
// import { createAutoformatPlugin } from '@udecode/slate-plugins-autoformat';
// import { createBasicElementPlugins } from '@udecode/slate-plugins-basic-elements';
// import {
//   createBasicMarkPlugins,
//   createBoldPlugin,
//   createCodePlugin,
//   createItalicPlugin,
//   createStrikethroughPlugin,
//   createSubscriptPlugin,
//   createSuperscriptPlugin,
//   createUnderlinePlugin,
// } from '@udecode/slate-plugins-basic-marks';
// import {
//   createBlockquotePlugin,
//   ELEMENT_BLOCKQUOTE,
// } from '@udecode/slate-plugins-block-quote';
// import {
//   createExitBreakPlugin,
//   createSoftBreakPlugin,
// } from '@udecode/slate-plugins-break';
// import { createCodeBlockPlugin } from '@udecode/slate-plugins-code-block';
// import {
//   createHistoryPlugin,
//   createReactPlugin,
// } from '@udecode/slate-plugins-core';
import {
  //   createExcalidrawPlugin,
  // ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/slate-plugins-excalidraw';
// import { createHeadingPlugin } from '@udecode/slate-plugins-heading';
// import { createHighlightPlugin } from '@udecode/slate-plugins-highlight';
// import { createDeserializeHTMLPlugin } from '@udecode/slate-plugins-html-serializer';
// import { createImagePlugin } from '@udecode/slate-plugins-image';
// import { createKbdPlugin } from '@udecode/slate-plugins-kbd';
// import { createLinkPlugin } from '@udecode/slate-plugins-link';
// import {
//   createListPlugin,
//   createTodoListPlugin,
// } from '@udecode/slate-plugins-list';
// import { createDeserializeMDPlugin } from '@udecode/slate-plugins-md-serializer';
// import { createMediaEmbedPlugin } from '@udecode/slate-plugins-media-embed';
// import { MentionElement } from '@udecode/slate-plugins-mention-ui';
// import { createNodeIdPlugin } from '@udecode/slate-plugins-node-id';
// import { createNormalizeTypesPlugin } from '@udecode/slate-plugins-normalizers';
// import { createParagraphPlugin } from '@udecode/slate-plugins-paragraph';
// import { createResetNodePlugin } from '@udecode/slate-plugins-reset-node';
// import { createSelectOnBackspacePlugin } from '@udecode/slate-plugins-select';
// import { createTablePlugin } from '@udecode/slate-plugins-table';
// import { createTrailingBlockPlugin } from '@udecode/slate-plugins-trailing-block';
import { StyledElement } from '@udecode/slate-plugins-ui';
// import {
// addColumn,
// addRow,
// BalloonToolbar,
// CodeBlockElement,
// deleteColumn,
// deleteRow,
// deleteTable,
// ELEMENT_ALIGN_CENTER,
// ELEMENT_ALIGN_JUSTIFY,
// ELEMENT_ALIGN_RIGHT,
// ELEMENT_BLOCKQUOTE,
// ELEMENT_CODE_BLOCK,
// ELEMENT_CODE_LINE,
// ELEMENT_DEFAULT,
// ELEMENT_H1,
// ELEMENT_H2,
// ELEMENT_H3,
// ELEMENT_H4,
// ELEMENT_H5,
// ELEMENT_H6,
// ELEMENT_IMAGE,
// ELEMENT_LI,
// ELEMENT_LIC,
// ELEMENT_LINK,
// ELEMENT_MEDIA_EMBED,
// ELEMENT_MENTION,
// ELEMENT_OL,
// ELEMENT_PARAGRAPH,
// ELEMENT_TABLE,
// ELEMENT_TD,
// ELEMENT_TH,
// ELEMENT_TODO_LI,
// ELEMENT_TR,
// ELEMENT_UL,
// getParent,
// getSlatePluginType,
// HeadingToolbar,
// insertEmptyCodeBlock,
// insertTable,
// isBlockAboveEmpty,
// isElement,
// isSelectionAtBlockStart,
// isType,
// KEYS_HEADING,
// MARK_BOLD,
// MARK_CODE,
// MARK_HIGHLIGHT,
// MARK_ITALIC,
// MARK_KBD,
// MARK_STRIKETHROUGH,
// MARK_SUBSCRIPT,
// MARK_SUPERSCRIPT,
// MARK_UNDERLINE,
// MentionElement,
// MentionSelect,
// serializeHTMLFromNodes,
// SlatePlugins,
// toggleList,
// ToolbarAlign,
// ToolbarCodeBlock,
// ToolbarElement,
// ToolbarImage,
// ToolbarLink,
// ToolbarList,
// ToolbarMark,
// ToolbarSearchHighlight,
// ToolbarTable,
// unwrapList,
// useEventEditorId,
// useFindReplacePlugin,
// useMentionPlugin,
// useSlatePlugins,
// useSlatePluginsActions,
// useStoreEditorEnabled,
// useStoreEditorRef,
// withProps,
// } from '@udecode/slate-plugins';
// import {
//   createExcalidrawPlugin,
//   ELEMENT_EXCALIDRAW,
//   ExcalidrawElement,
// } from '@udecode/slate-plugins-excalidraw';
import { createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import styled from 'styled-components';
// import { createEditorPlugins } from '../../../packages/slate-plugins/src/utils/createEditorPlugins';
// import { createSlatePluginsComponents } from '../../../packages/slate-plugins/src/utils/createSlatePluginsComponents';
// import { createSlatePluginsOptions } from '../../../packages/slate-plugins/src/utils/createSlatePluginsOptions';
// import { css } from 'styled-components';
// import { optionsAutoformat } from './config/autoformatRules';
// import {
//   getHugeDocument,
//   initialValueAutoformat,
//   initialValueBalloonToolbar,
//   initialValueBasicElements,
//   initialValueBasicMarks,
//   initialValueCombobox,
//   initialValueEmbeds,
//   initialValueExcalidraw,
//   initialValueExitBreak,
//   initialValueForcedLayout,
//   initialValueHighlight,
//   initialValueIframe,
//   initialValueImages,
//   initialValueKbd,
//   initialValueLinks,
//   initialValueList,
//   initialValueMarks,
//   initialValueMentions,
//   initialValuePasteHtml,
//   initialValuePasteMd,
//   initialValuePlaceholder,
//   initialValuePlainText,
//   initialValuePlayground,
//   initialValuePreview,
//   initialValueSearchHighlighting,
//   initialValueSoftBreak,
//   initialValueTables,
//   initialValueVoids,
// } from './config/initialValues';
// import { MENTIONABLES } from './config/mentionables';
// import {
//   optionsExitBreakPlugin,
//   optionsMentionPlugin,
//   optionsResetBlockTypePlugin,
//   optionsSoftBreakPlugin,
// } from './config/pluginOptions';
// import { renderMentionLabel } from './config/renderMentionLabel';
// import {
//   BallonToolbarMarks,
//   ToolbarButtonsAlign,
//   ToolbarButtonsBasicElements,
//   ToolbarButtonsBasicMarks,
//   ToolbarButtonsList,
//   ToolbarButtonsTable,
//   ToolbarHighlight,
//   ToolbarKbd,
// } from './config/Toolbars';
// import { withStyledDraggables } from './config/withStyledDraggables';
// import { withStyledPlaceHolders } from './config/withStyledPlaceHolders';
// import { useComboboxControls } from './examples/combobox/hooks/useComboboxControls';
// import { useComboboxOnChange } from './examples/combobox/hooks/useComboboxOnChange';
// import { useComboboxOnKeyDown } from './examples/combobox/hooks/useComboboxOnKeyDown';
// import { useComboboxIsOpen } from './examples/combobox/selectors/useComboboxIsOpen';
// import { useComboboxStore } from './examples/combobox/useComboboxStore';
// import { createEditableVoidPlugin } from './examples/editable-voids/createEditableVoidPlugin';
// import { EDITABLE_VOID } from './examples/editable-voids/defaults';
// import { EditableVoidElement } from './examples/editable-voids/EditableVoidElement';
// import { IFrame } from './examples/iframe/IFrame';
// import { createPreviewPlugin } from './examples/preview-markdown/createPreviewPlugin';
// import { TagCombobox } from './examples/tag/components/TagCombobox';
// import { TagElement } from './examples/tag/components/TagElement';
// import { createTagPlugin } from './examples/tag/createTagPlugin';
// import { ELEMENT_TAG } from './examples/tag/defaults';
// import { useTagOnChange } from './examples/tag/hooks/useTagOnChange';
// import { useTagOnSelectItem } from './examples/tag/hooks/useTagOnSelectItem';
// import { HighlightHTML } from './utils/HighlightHTML';

const editableProps = {
  placeholder: 'Type…',
  style: {
    padding: '15px',
  },
};

// const components = createSlatePluginsComponents({
//   [ELEMENT_CODE_BLOCK]: withProps(CodeBlockElement, {
//     styles: {
//       root: [
//         // css`
//         //   background-color: #111827;
//         //   code {
//         //     color: white;
//         //   }
//         // `,
//       ],
//     },
//   }),
// });

// const options = createSlatePluginsOptions();
//
// const pluginsCore = [createReactPlugin(), createHistoryPlugin()];
//
// const pluginsBasicElements = [
//   createParagraphPlugin(), // paragraph element
//   createBlockquotePlugin(), // blockquote element
//   createCodeBlockPlugin(), // code block element
//   createHeadingPlugin(), // heading elements
// ];
//
// const pluginsBasicMarks = [
//   createBoldPlugin(), // bold mark
//   createItalicPlugin(), // italic mark
//   createUnderlinePlugin(), // underline mark
//   createStrikethroughPlugin(), // strikethrough mark
//   createCodePlugin(), // code mark
// ];
//
// const pluginsBasic = [
//   ...pluginsCore,
//   ...pluginsBasicElements,
//   ...pluginsBasicMarks,
// ];
//
// const pluginsImage = [
//   ...pluginsCore,
//   ...createBasicElementPlugins(),
//   ...pluginsBasicMarks,
//   createImagePlugin(),
//   createSelectOnBackspacePlugin({ allow: [ELEMENT_IMAGE] }),
// ];
//
// const initialValueBasic = [
//   ...initialValueBasicElements,
//   ...initialValueBasicMarks,
// ];

// Add react-live imports you need here
const ReactLiveScope = {
  StyledElement,

  React,
  ...React,
  ExcalidrawElement,
  // createExcalidrawPlugin,
  // ELEMENT_EXCALIDRAW,

  // createAlignPlugin,
  // createAutoformatPlugin,
  // createBasicElementPlugins,
  // createBasicMarkPlugins,
  // createBlockquotePlugin,
  // createBoldPlugin,
  // createCodeBlockPlugin,
  // createCodePlugin,
  // createDeserializeHTMLPlugin,
  // createDeserializeMDPlugin,
  // createExitBreakPlugin,
  // createHeadingPlugin,
  // createHighlightPlugin,
  // createHistoryPlugin,
  // createImagePlugin,
  // createItalicPlugin,
  // createKbdPlugin,
  // createLinkPlugin,
  // createListPlugin,
  // createMediaEmbedPlugin,
  // createNodeIdPlugin,
  // createNormalizeTypesPlugin,
  // createParagraphPlugin,
  // createReactPlugin,
  // createResetNodePlugin,
  // createSelectOnBackspacePlugin,
  // createEditorPlugins,
  // createSlatePluginsComponents,
  // createSlatePluginsOptions,
  // createSoftBreakPlugin,
  // createStrikethroughPlugin,
  // createSubscriptPlugin,
  // createSuperscriptPlugin,
  // createTablePlugin,
  // createTodoListPlugin,
  // createTrailingBlockPlugin,
  // createUnderlinePlugin,

  // ELEMENT_DEFAULT,
  //    getParent,
  //    insertEmptyCodeBlock,
  //    isBlockAboveEmpty,
  //    isElement,
  //    isSelectionAtBlockStart,
  //    toggleList,
  //   BalloonToolbar,
  //   CodeBlockElement,
  //   ELEMENT_ALIGN_CENTER,
  //   ELEMENT_ALIGN_JUSTIFY,
  //   ELEMENT_ALIGN_RIGHT,
  // ELEMENT_BLOCKQUOTE,
  //   ELEMENT_CODE_BLOCK,
  //   ELEMENT_CODE_LINE,
  //   ELEMENT_H1,
  //   ELEMENT_H2,
  //   ELEMENT_H3,
  //   ELEMENT_H4,
  //   ELEMENT_H5,
  //   ELEMENT_H6,
  //   ELEMENT_IMAGE,
  //   ELEMENT_LI,
  //   ELEMENT_LIC,
  //   ELEMENT_LINK,
  //   ELEMENT_MEDIA_EMBED,
  //   ELEMENT_MENTION,
  //   ELEMENT_OL,
  //   ELEMENT_PARAGRAPH,
  //   ELEMENT_TABLE,
  //   ELEMENT_TD,
  //   ELEMENT_TH,
  //   ELEMENT_TODO_LI,
  //   ELEMENT_TR,
  //   ELEMENT_UL,
  //   HeadingToolbar,
  //   KEYS_HEADING,
  //   MARK_BOLD,
  //   MARK_CODE,
  //   MARK_HIGHLIGHT,
  //   MARK_ITALIC,
  //   MARK_KBD,
  //   MARK_STRIKETHROUGH,
  //   MARK_SUBSCRIPT,
  //   MARK_SUPERSCRIPT,
  //   MARK_UNDERLINE,
  // MentionElement,
  //   MentionSelect,
  //   SlatePlugins,
  //   ToolbarAlign,
  //   ToolbarCodeBlock,
  //   ToolbarElement,
  //   ToolbarImage,
  //   ToolbarLink,
  //   ToolbarList,
  //   ToolbarMark,
  //   ToolbarSearchHighlight,
  //   ToolbarTable,
  //   addColumn,
  //   addRow,
  // deleteColumn,
  // deleteRow,
  // deleteTable,
  // getSlatePluginType,
  // insertTable,
  // isType,
  // serializeHTMLFromNodes,
  // unwrapList,
  // useEventEditorId,
  // useFindReplacePlugin,
  // useMentionPlugin,
  // useSlatePlugins,
  // useSlatePluginsActions,
  // useStoreEditorEnabled,
  // useStoreEditorRef,
  // withProps,

  // CodeAlt,
  // CodeBlock,
  // Highlight,
  // Subscript,
  // Superscript,
  // BorderAll,
  // BorderBottom,
  // BorderClear,
  // BorderLeft,
  // BorderRight,
  // BorderTop,
  // FormatAlignCenter,
  // FormatAlignJustify,
  // FormatAlignLeft,
  // FormatAlignRight,
  // FormatBold,
  // FormatItalic,
  // FormatListBulleted,
  // FormatListNumbered,
  // FormatQuote,
  // FormatStrikethrough,
  // FormatUnderlined,
  // Keyboard,
  // Looks3,
  // Looks4,
  // Looks5,
  // Looks6,
  // LooksOne,
  // LooksTwo,
  Slate,
  Editable,
  useCallback,
  // IFrame,
  // useComboboxOnChange,
  // useComboboxControls,
  // useComboboxOnKeyDown,
  // useComboboxIsOpen,
  // useComboboxStore,
  // TagCombobox,
  // TagElement,
  // createTagPlugin,
  // ELEMENT_TAG,
  // useTagOnChange,
  // useTagOnSelectItem,
  // EDITABLE_VOID,
  // EditableVoidElement,  createPreviewPlugin,
  // createEditableVoidPlugin,
  // withStyledDraggables,
  // withStyledPlaceHolders,
  // components,
  // corePlugins: pluginsCore,
  // initialValueBasic,
  // options,
  // pluginsBasic,
  // pluginsBasicElements,
  // pluginsBasicMarks,
  // pluginsCore,
  // pluginsImage,

  // initialValuePlayground,
  // optionsMentionPlugin,
  // renderMentionLabel,
  // initialValueCombobox,
  // initialValueIframe,
  // BallonToolbarMarks,
  // initialValuePasteMd,
  // initialValuePreview,
  // initialValueExcalidraw,
  //   initialValueBalloonToolbar,
  //   initialValueAutoformat,
  //   initialValueBasicElements,
  //   initialValueBasicMarks,
  //   initialValueEmbeds,
  //   initialValueExitBreak,
  //   initialValueForcedLayout,
  //   initialValueHighlight,
  //   initialValueImages,
  //   initialValueKbd,
  //   initialValueLinks,
  //   initialValueList,
  //   initialValueMarks,
  //   initialValueMentions,
  //   initialValuePasteHtml,
  //   initialValuePlaceholder,
  //   initialValuePlainText,
  //   initialValueSearchHighlighting,
  //   initialValueSoftBreak,
  //   initialValueTables,
  //   initialValueVoids,
  //   MENTIONABLES,
  //   optionsAutoformat,
  //   optionsExitBreakPlugin,
  //   optionsResetBlockTypePlugin,
  //   optionsSoftBreakPlugin,
  //   ToolbarButtonsAlign,
  //   ToolbarButtonsBasicElements,
  //   ToolbarButtonsBasicMarks,
  //   ToolbarButtonsList,
  //   ToolbarButtonsTable,
  //   ToolbarKbd,
  //   ToolbarHighlight,
  //   getHugeDocument,

  // DndProvider,
  //   HTML5Backend,
  // HighlightHTML,
  ReactEditor,
  createEditor,
  editableProps,
  // Search,
  // Link,
  // Image,
  withReact,
};

export default ReactLiveScope;
