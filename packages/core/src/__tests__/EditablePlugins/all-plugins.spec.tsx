import React, { useMemo, useState } from 'react';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
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
import {
  ActionItemPlugin,
  BalloonToolbar,
  BasicElementPlugins,
  BasicMarkPlugins,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  HeadingToolbar,
  HighlightPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MediaEmbedPlugin,
  MentionPlugin,
  ParagraphPlugin,
  renderLeafBold,
  renderLeafCode,
  renderLeafHighlight,
  renderLeafItalic,
  renderLeafStrikethrough,
  renderLeafSubscript,
  renderLeafSuperscript,
  renderLeafUnderline,
  SearchHighlightPlugin,
  SlateDocument,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  ToolbarElement,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarMark,
  ToolbarTable,
  UnderlinePlugin,
  withAutoformat,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withNodeID,
  withNormalizeTypes,
  withResetBlockType,
  withTable,
  withToggleType,
  withTransforms,
} from '@udecode/slate-plugins/src';
import { pipe } from '@udecode/slate-plugins/src/common/utils/pipe';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
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
  withAutoformat(nodeTypes),
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
