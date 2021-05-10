import React, { useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Image } from '@styled-icons/material/Image';
import { Link } from '@styled-icons/material/Link';
import { Search } from '@styled-icons/material/Search';
import {
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
  SlatePlugins,
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
import { CodeBlockElement } from '@udecode/slate-plugins-code-block-ui';
import { useStoreEditorRef } from '@udecode/slate-plugins-core';
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
import { createHeadingPlugin } from '../../../packages/elements/heading/src/createHeadingPlugin';
import { ToolbarImage } from '../../../packages/elements/image-ui/src/ToolbarImage/ToolbarImage';
import { ToolbarLink } from '../../../packages/elements/link-ui/src/ToolbarLink/ToolbarLink';
import { ELEMENT_LIC } from '../../../packages/elements/list/src/defaults';
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

export const components = createSlatePluginsComponents({
  [ELEMENT_CODE_BLOCK]: withProps(CodeBlockElement, {
    styles: {
      root: {
        backgroundColor: '#111827',
        selectors: {
          code: {
            color: 'white',
          },
        },
      },
    },
  }),
});

export const options = createSlatePluginsOptions();

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
  initialValuePlayground,
  optionsMentionPlugin,
  useSlatePluginsActions,
  useStoreEditorEnabled,
  renderMentionLabel,
  useComboboxOnChange,
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
  createEditorPlugins,
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
