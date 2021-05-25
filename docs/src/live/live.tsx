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
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import { FormatBold } from '@styled-icons/material/FormatBold';
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
  createAutoformatPlugin,
  createDeserializeHTMLPlugin,
  createDeserializeMDPlugin,
  createEditorPlugins,
  createExitBreakPlugin,
  createHighlightPlugin,
  createHistoryPlugin,
  createKbdPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  deleteColumn,
  deleteRow,
  deleteTable,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
  insertTable,
  SlatePlugins,
  ToolbarAlign,
  ToolbarElement,
  ToolbarList,
  ToolbarTable,
  useFindReplacePlugin,
  useMentionPlugin,
  useSlatePlugins,
  useSlatePluginsActions,
  useStoreEditorEnabled,
  withProps,
} from '@udecode/slate-plugins';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/slate-plugins-basic-marks';
import {
  createBlockquotePlugin,
  ELEMENT_BLOCKQUOTE,
} from '@udecode/slate-plugins-block-quote';
import {
  createCodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/slate-plugins-code-block';
import {
  CodeBlockElement,
  ToolbarCodeBlock,
} from '@udecode/slate-plugins-code-block-ui';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins-core';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/slate-plugins-heading';
import { MARK_HIGHLIGHT } from '@udecode/slate-plugins-highlight';
import { createImagePlugin, ELEMENT_IMAGE } from '@udecode/slate-plugins-image';
import { MARK_KBD } from '@udecode/slate-plugins-kbd';
import { ELEMENT_LINK } from '@udecode/slate-plugins-link';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/slate-plugins-list';
import { ELEMENT_MEDIA_EMBED } from '@udecode/slate-plugins-media-embed';
import { ELEMENT_MENTION } from '@udecode/slate-plugins-mention';
import { MentionElement } from '@udecode/slate-plugins-mention-ui';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@udecode/slate-plugins-table';
import { HeadingToolbar } from '@udecode/slate-plugins-toolbar';
import { createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { createAlignPlugin } from '../../../packages/elements/alignment/src/createAlignPlugin';
import { createBasicElementPlugins } from '../../../packages/elements/basic-elements/src/createBasicElementPlugins';
import { ELEMENT_EXCALIDRAW } from '../../../packages/elements/excalidraw';
import { createExcalidrawPlugin } from '../../../packages/elements/excalidraw/src/createExcalidrawPlugin';
import { createHeadingPlugin } from '../../../packages/elements/heading/src/createHeadingPlugin';
import { KEYS_HEADING } from '../../../packages/elements/heading/src/defaults';
import { ToolbarImage } from '../../../packages/elements/image-ui/src/ToolbarImage/ToolbarImage';
import { ToolbarLink } from '../../../packages/elements/link-ui/src/ToolbarLink/ToolbarLink';
import { ELEMENT_LIC } from '../../../packages/elements/list/src/defaults';
import { unwrapList } from '../../../packages/elements/list/src/transforms/unwrapList';
import { MentionSelect } from '../../../packages/elements/mention-ui/src/MentionSelect/MentionSelect';
import { createParagraphPlugin } from '../../../packages/elements/paragraph/src/createParagraphPlugin';
import { ToolbarSearchHighlight } from '../../../packages/find-replace-ui/src/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { createBoldPlugin } from '../../../packages/marks/basic-marks/src/bold/createBoldPlugin';
import { createCodePlugin } from '../../../packages/marks/basic-marks/src/code/createCodePlugin';
import { createBasicMarkPlugins } from '../../../packages/marks/basic-marks/src/createBasicMarkPlugins';
import { createItalicPlugin } from '../../../packages/marks/basic-marks/src/italic/createItalicPlugin';
import { createStrikethroughPlugin } from '../../../packages/marks/basic-marks/src/strikethrough/createStrikethroughPlugin';
import { createUnderlinePlugin } from '../../../packages/marks/basic-marks/src/underline/createUnderlinePlugin';
import { createSelectOnBackspacePlugin } from '../../../packages/select/src/createSelectOnBackspacePlugin';
import { serializeHTMLFromNodes } from '../../../packages/serializers/html-serializer/src/serializer/serializeHTMLFromNodes';
import { BalloonToolbar } from '../../../packages/ui/toolbar/src/BalloonToolbar/BalloonToolbar';
import { ToolbarMark } from '../../../packages/ui/toolbar/src/ToolbarMark/ToolbarMark';
import { optionsAutoformat } from './config/autoformatRules';
import {
  getHugeDocument,
  initialValueAutoformat,
  initialValueBalloonToolbar,
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValueCombobox,
  initialValueEmbeds,
  initialValueExitBreak,
  initialValueForcedLayout,
  initialValueHighlight,
  initialValueIframe,
  initialValueImages,
  initialValueKbd,
  initialValueLinks,
  initialValueList,
  initialValueMarks,
  initialValueMentions,
  initialValuePasteHtml,
  initialValuePasteMd,
  initialValuePlaceholder,
  initialValuePlainText,
  initialValuePlayground,
  initialValuePreview,
  initialValueSearchHighlighting,
  initialValueSoftBreak,
  initialValueTables,
  initialValueVoids,
} from './config/initialValues';
import { MENTIONABLES } from './config/mentionables';
import {
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

const components = createSlatePluginsComponents();

const options = createSlatePluginsOptions();

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
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
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
  useSlatePluginsActions,
  useStoreEditorEnabled,
  renderMentionLabel,
  useComboboxOnChange,
  CodeBlockElement,
  Slate,
  Editable,
  createSlatePluginsOptions,
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
  useSlatePlugins,
  useStoreEditorRef,
  HighlightHTML,
  BallonToolbarMarks,
  initialValuePasteMd,
  createDeserializeMDPlugin,
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
  createSlatePluginsComponents,
  createSoftBreakPlugin,
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
  getSlatePluginType,
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
  pluginsImage,
  Search,
  serializeHTMLFromNodes,
  SlatePlugins,
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
};

export default ReactLiveScope;
