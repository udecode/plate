import React, { useMemo, useState } from 'react';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
  FormatAlignCenter,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  Image,
  Link,
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { autoformatRulesFixtures } from '../../../../slate-plugins/src/__fixtures__/autoformat.fixtures';
import {
  initialValueAutoformat,
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValueEmbeds,
  initialValueExitBreak,
  initialValueForcedLayout,
  initialValueHighlight,
  initialValueImages,
  initialValueLinks,
  initialValueList,
  initialValueMentions,
  initialValuePasteHtml,
  initialValueSoftBreak,
  initialValueTables,
  nodeTypes,
} from '../../../../slate-plugins/src/__fixtures__/initialValues.fixtures';
import { withNodeID } from '../../../../slate-plugins/src/common/transforms/node-id/withNodeID';
import { withTransforms } from '../../../../slate-plugins/src/common/transforms/withTransforms';
import { SlateDocument } from '../../../../slate-plugins/src/common/types/SlateDocument.types';
import { pipe } from '../../../../slate-plugins/src/common/utils/pipe';
import { BalloonToolbar } from '../../../../slate-plugins/src/components/Toolbar/BalloonToolbar/BalloonToolbar';
import { HeadingToolbar } from '../../../../slate-plugins/src/components/Toolbar/HeadingToolbar/HeadingToolbar';
import { withDeserializeHTML } from '../../../../slate-plugins/src/deserializers/deserialize-html/withDeserializeHTML';
import { ToolbarElement } from '../../../../slate-plugins/src/element/components/ToolbarElement';
import { withInlineVoid } from '../../../../slate-plugins/src/element/withInlineVoid';
import { withToggleType } from '../../../../slate-plugins/src/element/withToggleType';
import { ActionItemPlugin } from '../../../../slate-plugins/src/elements/action-item/ActionItemPlugin';
import { AlignPlugin } from '../../../../slate-plugins/src/elements/align/AlignPlugin';
import { ToolbarAlign } from '../../../../slate-plugins/src/elements/align/components/ToolbarAlign';
import { BasicElementPlugins } from '../../../../slate-plugins/src/elements/basic-elements/BasicElementPlugins';
import { BlockquotePlugin } from '../../../../slate-plugins/src/elements/blockquote/BlockquotePlugin';
import { CodeBlockPlugin } from '../../../../slate-plugins/src/elements/code-block/CodeBlockPlugin';
import { HeadingPlugin } from '../../../../slate-plugins/src/elements/heading/HeadingPlugin';
import { ToolbarImage } from '../../../../slate-plugins/src/elements/image/components/ToolbarImage';
import { withImageUpload } from '../../../../slate-plugins/src/elements/image/image-upload/withImageUpload';
import { ImagePlugin } from '../../../../slate-plugins/src/elements/image/ImagePlugin';
import { ToolbarLink } from '../../../../slate-plugins/src/elements/link/components/ToolbarLink';
import { LinkPlugin } from '../../../../slate-plugins/src/elements/link/LinkPlugin';
import { withLink } from '../../../../slate-plugins/src/elements/link/withLink';
import { ToolbarList } from '../../../../slate-plugins/src/elements/list/components/ToolbarList';
import { ListPlugin } from '../../../../slate-plugins/src/elements/list/ListPlugin';
import { withList } from '../../../../slate-plugins/src/elements/list/withList';
import { MediaEmbedPlugin } from '../../../../slate-plugins/src/elements/media-embed/MediaEmbedPlugin';
import { MentionPlugin } from '../../../../slate-plugins/src/elements/mention/MentionPlugin';
import { ParagraphPlugin } from '../../../../slate-plugins/src/elements/paragraph/ParagraphPlugin';
import { ToolbarTable } from '../../../../slate-plugins/src/elements/table/components/ToolbarTable';
import { TablePlugin } from '../../../../slate-plugins/src/elements/table/TablePlugin';
import { withTable } from '../../../../slate-plugins/src/elements/table/withTable';
import { withAutoformat } from '../../../../slate-plugins/src/handlers/autoformat/withAutoformat';
import { ExitBreakPlugin } from '../../../../slate-plugins/src/handlers/exit-break/ExitBreakPlugin';
import { withResetBlockType } from '../../../../slate-plugins/src/handlers/reset-block-type/withResetBlockType';
import { SoftBreakPlugin } from '../../../../slate-plugins/src/handlers/soft-break/SoftBreakPlugin';
import { ToolbarMark } from '../../../../slate-plugins/src/mark/components/ToolbarMark';
import { BasicMarkPlugins } from '../../../../slate-plugins/src/marks/basic-marks/BasicMarkPlugins';
import { BoldPlugin } from '../../../../slate-plugins/src/marks/bold/BoldPlugin';
import { renderLeafBold } from '../../../../slate-plugins/src/marks/bold/renderLeafBold';
import { MARK_BOLD } from '../../../../slate-plugins/src/marks/bold/types';
import { CodePlugin } from '../../../../slate-plugins/src/marks/code/CodePlugin';
import { renderLeafCode } from '../../../../slate-plugins/src/marks/code/renderLeafCode';
import { MARK_CODE } from '../../../../slate-plugins/src/marks/code/types';
import { HighlightPlugin } from '../../../../slate-plugins/src/marks/highlight/HighlightPlugin';
import { renderLeafHighlight } from '../../../../slate-plugins/src/marks/highlight/renderLeafHighlight';
import { ItalicPlugin } from '../../../../slate-plugins/src/marks/italic/ItalicPlugin';
import { renderLeafItalic } from '../../../../slate-plugins/src/marks/italic/renderLeafItalic';
import { MARK_ITALIC } from '../../../../slate-plugins/src/marks/italic/types';
import { renderLeafStrikethrough } from '../../../../slate-plugins/src/marks/strikethrough/renderLeafStrikethrough';
import { StrikethroughPlugin } from '../../../../slate-plugins/src/marks/strikethrough/StrikethroughPlugin';
import { MARK_STRIKETHROUGH } from '../../../../slate-plugins/src/marks/strikethrough/types';
import { renderLeafSubscript } from '../../../../slate-plugins/src/marks/subscript/renderLeafSubscript';
import { SubscriptPlugin } from '../../../../slate-plugins/src/marks/subscript/SubscriptPlugin';
import { MARK_SUBSCRIPT } from '../../../../slate-plugins/src/marks/subscript/types';
import { renderLeafSuperscript } from '../../../../slate-plugins/src/marks/superscript/renderLeafSuperscript';
import { SuperscriptPlugin } from '../../../../slate-plugins/src/marks/superscript/SuperscriptPlugin';
import { MARK_SUPERSCRIPT } from '../../../../slate-plugins/src/marks/superscript/types';
import { renderLeafUnderline } from '../../../../slate-plugins/src/marks/underline/renderLeafUnderline';
import { MARK_UNDERLINE } from '../../../../slate-plugins/src/marks/underline/types';
import { UnderlinePlugin } from '../../../../slate-plugins/src/marks/underline/UnderlinePlugin';
import { withNormalizeTypes } from '../../../../slate-plugins/src/normalizers/withNormalizeTypes';
import { SearchHighlightPlugin } from '../../../../slate-plugins/src/widgets/search-highlight/SearchHighlightPlugin';
import { EditablePlugins } from '../../components/EditablePlugins';

const markOptions = { ...nodeTypes, hotkey: '' };

const plugins = [
  ...BasicElementPlugins(),
  ...BasicMarkPlugins(),
  BlockquotePlugin(nodeTypes),
  ActionItemPlugin(nodeTypes),
  HeadingPlugin(nodeTypes),
  ImagePlugin(nodeTypes),
  LinkPlugin(nodeTypes),
  ListPlugin(nodeTypes),
  MentionPlugin(nodeTypes),
  ParagraphPlugin(nodeTypes),
  TablePlugin(nodeTypes),
  MediaEmbedPlugin(nodeTypes),
  CodeBlockPlugin(nodeTypes),
  AlignPlugin(nodeTypes),
  BoldPlugin(markOptions),
  BoldPlugin(),
  CodePlugin(markOptions),
  CodePlugin(),
  ItalicPlugin(markOptions),
  ItalicPlugin(),
  StrikethroughPlugin(markOptions),
  StrikethroughPlugin(),
  HighlightPlugin(markOptions),
  HighlightPlugin(),
  UnderlinePlugin(markOptions),
  UnderlinePlugin(),
  SubscriptPlugin(markOptions),
  SubscriptPlugin(),
  SuperscriptPlugin(markOptions),
  SuperscriptPlugin(),
  SearchHighlightPlugin(),
  SoftBreakPlugin(),
  ExitBreakPlugin(),
];

const initialValue = [
  ...initialValueForcedLayout,
  ...initialValueBasicMarks,
  ...initialValueHighlight,
  ...initialValueBasicElements,
  ...initialValueList,
  ...initialValueTables,
  ...initialValueLinks,
  ...initialValueMentions,
  ...initialValueImages,
  ...initialValueEmbeds,
  ...initialValueAutoformat,
  ...initialValueSoftBreak,
  ...initialValueExitBreak,
  ...initialValuePasteHtml,
];

const withPlugins = [
  withReact,
  withHistory,
  withTable(nodeTypes),
  withLink(),
  withDeserializeHTML({ plugins }),
  withImageUpload(),
  withToggleType({ defaultType: nodeTypes.typeP }),
  withResetBlockType({
    types: [nodeTypes.typeActionItem, nodeTypes.typeBlockquote],
    defaultType: nodeTypes.typeP,
  }),
  withList(nodeTypes),
  withAutoformat({ rules: autoformatRulesFixtures }),
  withTransforms(),
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: nodeTypes.typeH1 }],
  }),
  withNodeID(),
  withInlineVoid({ plugins }),
] as const;

const Editor = () => {
  const decorate: any = [];
  const onKeyDown: any = [];

  const [value, setValue] = useState(initialValue);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue as SlateDocument);
      }}
    >
      <HeadingToolbar>
        <ToolbarElement type={nodeTypes.typeH1} icon={<LooksOne />} />
        <ToolbarElement type={nodeTypes.typeH2} icon={<LooksTwo />} />
        <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
        <ToolbarMark type={MARK_STRIKETHROUGH} icon={<FormatStrikethrough />} />
        <ToolbarMark type={MARK_CODE} icon={<CodeAlt />} />
        <ToolbarMark
          type={MARK_SUPERSCRIPT}
          clear={MARK_SUBSCRIPT}
          icon={<Superscript />}
        />
        <ToolbarMark
          type={MARK_SUBSCRIPT}
          clear={MARK_SUPERSCRIPT}
          icon={<Subscript />}
        />
        <ToolbarLink {...nodeTypes} icon={<Link />} />
        <ToolbarList {...nodeTypes} icon={<FormatListBulleted />} />
        <ToolbarList {...nodeTypes} icon={<FormatListNumbered />} />
        <ToolbarElement
          type={nodeTypes.typeBlockquote}
          icon={<FormatQuote />}
        />
        <ToolbarImage {...nodeTypes} icon={<Image />} />
        <ToolbarTable transform={jest.fn()} icon={null} />
        <ToolbarAlign icon={<FormatAlignLeft />} />
        <ToolbarAlign
          type={nodeTypes.typeAlignCenter}
          icon={<FormatAlignCenter />}
        />
        <ToolbarAlign
          type={nodeTypes.typeAlignRight}
          icon={<FormatAlignRight />}
        />
      </HeadingToolbar>
      <BalloonToolbar>
        <ToolbarMark reversed type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark reversed type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </BalloonToolbar>
      <EditablePlugins
        data-testid="EditablePlugins"
        plugins={plugins}
        decorate={decorate}
        onKeyDown={onKeyDown}
        renderLeaf={[
          renderLeafHighlight(),
          renderLeafBold(),
          renderLeafCode(),
          renderLeafItalic(),
          renderLeafStrikethrough(),
          renderLeafSubscript(),
          renderLeafSuperscript(),
          renderLeafUnderline(),
        ]}
        placeholder="Enter some plain text..."
      />
    </Slate>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<Editor />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});
